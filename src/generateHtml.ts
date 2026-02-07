import React from "react";
import ReactDOMServer from "react-dom/server";
import fs from "fs/promises";
import path from "path";
import type { ExportableTranscript } from "../types/exportableTranscript";
import Transcript from "./web/discord-components/Transcript";
import type { ChannelInfo } from "./web/types/channel";
import type { TranscriptThemes } from "./web/types/theme";
import type { TranscriptSSRProps } from "./web/types/props";
import { AssetManager } from "./utils/assetManager";
import esbuild from "esbuild";
import { TranscriptCreateOptions } from "../types/general";

function TranscriptSSRWrapper(props: TranscriptSSRProps): React.ReactElement {
	return React.createElement(Transcript, {
		channel: props.channel,
		messages: props.messages,
		theme: props.theme,
		allowThemeSwitching: props.allowThemeSwitching,
		allowThemeSwitchingPersist: props.allowThemeSwitchingPersist,
		poweredBy: props.poweredBy,
		className: props.className || "",
		resolvedUsers: props.resolvedUsers,
		resolvedRoles: props.resolvedRoles,
		resolvedChannels: props.resolvedChannels,
		exportedAt: props.exportedAt
	});
}

function buildHtmlDocument(content: string, transcriptData: string, clientCode: string): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Discord Transcript</title>
	<script src="https://cdn.tailwindcss.com"></script>
	<style id="app-css">[APP_CSS]</style>
	<style id="highlight-css">[HIGHLIGHT_CSS]</style>
	<script>window.__TRANSCRIPT_DATA__=${transcriptData};</script>
</head>
<body>
	<div id="root">${content}</div>
	<script type="module">${clientCode}</script>
</body>
</html>`;
}

export async function generateHtml(transcript: ExportableTranscript, options: TranscriptCreateOptions = {}): Promise<string> {
	const { filename, poweredBy = true, allowThemeSwitching = true, theme = "dark", ignore = {} } = options;

	const channelInfo: ChannelInfo = {
		name: transcript.meta.channelName || "transcript",
		topic: undefined,
		id: transcript.meta.channelId,
		guildId: transcript.meta.guildId ?? null
	};

	const messages = transcript.messages.filter((msg) => {
		const authorId = typeof msg.author === "string" ? msg.author : null;
		if (authorId && Array.isArray(ignore?.userIDs) && ignore.userIDs.includes(authorId)) return false;
		if (ignore?.bots) {
			const resolved = transcript.resolvedUsers || {};
			const authorData = authorId ? resolved[authorId] : null;
			if (authorData?.bot) return false;
		}
		return true;
	});

	let processedMessages = messages;

	let transcriptDataToProcess: any = null;

	let assetManager: AssetManager | null = null;

	const saveOpt = (options as any).saveAssets ?? (options as any).saveImages;

	if (!saveOpt) {
		try {
			if (transcript.resolvedUsers && typeof transcript.resolvedUsers === "object") {
				for (const [uid, u] of Object.entries(transcript.resolvedUsers)) {
					try {
						const user = u as any;
						if (user && typeof user.avatar === "string" && !/^https?:\/\//i.test(user.avatar) && !/^assets\//.test(user.avatar)) {
							const isAnimated = user.avatar.startsWith("a_");
							const ext = isAnimated ? ".gif" : ".png";
							user.avatar = `https://cdn.discordapp.com/avatars/${uid}/${user.avatar}${ext}?size=128`;
						}

						if (
							user &&
							user.guildTag &&
							user.guildTag.iconUrl &&
							typeof user.guildTag.iconUrl === "string" &&
							!/^https?:\/\//i.test(user.guildTag.iconUrl) &&
							!/^assets\//.test(user.guildTag.iconUrl)
						) {
							user.guildTag.iconUrl = `https://cdn.discordapp.com/guilds/${user.guildTag.id || "0"}/icons/${user.guildTag.iconUrl}.png`;
						}
					} catch (e) {}
				}
			}

			if (Array.isArray(messages)) {
				for (const m of messages) {
					if (m && Array.isArray(m.stickers)) {
						for (const st0 of m.stickers as any[]) {
							try {
								const st = st0 as any;
								if (st && typeof st === "object") {
									const id = st.id || st.sticker_id || st.assetId || null;
									if (id && !st.url) {
										st.url = `https://media.discordapp.net/stickers/${id}.webp?size=160&quality=lossless`;
									}
								}
							} catch (e) {}
						}
					}
				}
			}
		} catch (e) {}
	}

	if (saveOpt) {
		const compression = typeof saveOpt === "object" && typeof saveOpt.compression === "number" ? saveOpt.compression : undefined;
		const assetsDirOption = typeof saveOpt === "object" && typeof saveOpt.dir === "string" ? saveOpt.dir : "assets";
		const assetsDir = path.isAbsolute(assetsDirOption) ? assetsDirOption : path.join(process.cwd(), assetsDirOption);
		assetManager = new AssetManager(assetsDir, { compression });
		await assetManager.initialize();

		transcriptDataToProcess = JSON.parse(
			JSON.stringify({
				messages: processedMessages,
				resolvedUsers: transcript.resolvedUsers,
				resolvedRoles: transcript.resolvedRoles,
				meta: transcript.meta
			})
		) as any;

		if (transcriptDataToProcess.resolvedUsers && typeof transcriptDataToProcess.resolvedUsers === "object") {
			for (const [uid, u] of Object.entries(transcriptDataToProcess.resolvedUsers)) {
				try {
					const user = u as any;
					if (user && typeof user.avatar === "string" && !/^https?:\/\//i.test(user.avatar)) {
						const isAnimated = user.avatar.startsWith("a_");
						const ext = isAnimated ? ".gif" : ".png";
						user.avatar = `https://cdn.discordapp.com/avatars/${uid}/${user.avatar}${ext}?size=128`;
					}

					if (
						user &&
						user.guildTag &&
						user.guildTag.iconUrl &&
						typeof user.guildTag.iconUrl === "string" &&
						!/^https?:\/\//i.test(user.guildTag.iconUrl)
					) {
						user.guildTag.iconUrl = `https://cdn.discordapp.com/guilds/${user.guildTag.id || "0"}/icons/${user.guildTag.iconUrl}.png`;
					}
				} catch (e) {}
			}
		}

		if (Array.isArray(transcriptDataToProcess.messages)) {
			for (const m of transcriptDataToProcess.messages) {
				if (m && Array.isArray(m.stickers)) {
					for (const st of m.stickers) {
						try {
							if (st && typeof st === "object") {
								const id = st.id || st.sticker_id || st.assetId || null;
								if (id && !st.url) {
									st.url = `https://media.discordapp.net/stickers/${id}.webp?size=160&quality=lossless`;
								}
							}
						} catch (e) {}
					}
				}
			}
		}

		await assetManager.downloadAssets(transcriptDataToProcess);
		transcriptDataToProcess = assetManager.replaceUrls(transcriptDataToProcess) as any;

		processedMessages = transcriptDataToProcess.messages;
	}

	const resolvedTheme: TranscriptThemes = (theme === "system" ? "dark" : theme) as TranscriptThemes;

	const props: TranscriptSSRProps = {
		channel: channelInfo,
		messages: processedMessages,
		theme: resolvedTheme,
		allowThemeSwitching,
		allowThemeSwitchingPersist: true,
		poweredBy: poweredBy,
		className: "transcript-ssr"
	};

	let resolvedUsers = transcript.resolvedUsers || {};
	let resolvedRoles = transcript.resolvedRoles || {};
	let resolvedChannels = (transcript as any).resolvedChannels || {};

	if (transcriptDataToProcess) {
		resolvedUsers = transcriptDataToProcess.resolvedUsers || resolvedUsers;
		resolvedRoles = transcriptDataToProcess.resolvedRoles || resolvedRoles;
		resolvedChannels = transcriptDataToProcess.resolvedChannels || resolvedChannels;
	}

	try {
		const stripped: Record<string, { name?: string | null }> = {};
		for (const k of Object.keys(resolvedChannels || {})) {
			const v = (resolvedChannels as any)[k];
			if (v && typeof v === "object") stripped[k] = { name: v.name ?? null };
			else stripped[k] = { name: (v as any)?.name ?? null };
		}
		resolvedChannels = stripped;
	} catch (e) {}

	let effectiveResolvedUsers: Record<string, unknown> = resolvedUsers;
	if (ignore?.guildBadges) {
		effectiveResolvedUsers = {};
		for (const k of Object.keys(resolvedUsers)) {
			const v = (resolvedUsers as any)[k];
			if (v && typeof v === "object") {
				const { guildTag, ...rest } = v as any;
				effectiveResolvedUsers[k] = rest;
			} else {
				effectiveResolvedUsers[k] = v;
			}
		}
	}

	const ssrProps = Object.assign({}, props, {
		resolvedUsers: effectiveResolvedUsers,
		resolvedRoles,
		resolvedChannels,
		exportedAt: transcript.meta.generatedAt
	});

	const _origConsoleError = console.error;
	console.error = (...args: any[]) => {
		try {
			const msg = String(args && args.length ? args[0] : "");
			if (msg && msg.includes('Each child in a list should have a unique "key" prop')) {
				const stack = new Error().stack || "";
				const out = `=== React Key Warning ===\nMessage: ${msg}\nArgs:${JSON.stringify(args.slice(1), null, 2)}\nStack:${stack}\n\n`;
				try {
					fs.appendFile(path.join(process.cwd(), ".react-key-warning.log"), out, "utf-8");
				} catch (e) {}
			}
		} catch (e) {}
		return _origConsoleError.apply(console, args as any);
	};
	const content: string = ReactDOMServer.renderToString(React.createElement(TranscriptSSRWrapper, ssrProps));
	console.error = _origConsoleError;

	const transcriptData: string = JSON.stringify({
		channel: channelInfo,
		messages: processedMessages,
		theme: resolvedTheme,
		allowThemeSwitching: allowThemeSwitching,
		allowThemeSwitchingPersist: true,
		resolvedUsers: effectiveResolvedUsers,
		resolvedRoles,
		resolvedChannels,
		exportedAt: transcript.meta.generatedAt,
		poweredBy: props.poweredBy,
		cdnBase: saveOpt ? "" : undefined,
		mediaBase: saveOpt ? "" : undefined
	});

	let clientCode: string = await bundleClientToString();

	if (assetManager) {
		try {
			await assetManager.downloadAssets(clientCode);
			clientCode = assetManager.replaceUrls(clientCode) as string;
		} catch (e) {}
	}

	let html = buildHtmlDocument(content, transcriptData, clientCode);

	try {
		const appCssPath: string = path.join(process.cwd(), "src", "web", "index.css");
		const highlightCssPath: string = path.join(process.cwd(), "src", "web", "highlight-theme.css");
		let appCss: string = await fs.readFile(appCssPath, "utf-8").catch(() => "");
		let highlightCss: string = await fs.readFile(highlightCssPath, "utf-8").catch(() => "");
		const highlightThemePath = path.join(process.cwd(), "node_modules", "highlight.js", "styles", "atom-one-dark.css");
		const highlightTheme = await fs.readFile(highlightThemePath, "utf-8").catch(() => "");
		if (highlightTheme) {
			highlightCss = highlightCss.replace(/@import\s+['"]highlight\.js\/styles\/atom-one-dark\.css['"];?/g, highlightTheme);
		} else {
			highlightCss = highlightCss.replace(/@import\s+['"]highlight\.js\/styles\/atom-one-dark\.css['"];?/g, "");
		}

		appCss = appCss.replace(/^@tailwind.*$/gm, "");
		html = html.replace("[APP_CSS]", appCss.replace(/<\/style>/g, ""));
		html = html.replace("[HIGHLIGHT_CSS]", highlightCss.replace(/<\/style>/g, ""));
	} catch (e) {}

	if (assetManager) {
		try {
			await assetManager.downloadAssets(html);
			html = assetManager.replaceUrls(html) as string;
		} catch (e) {}
	}

	if (typeof filename === "string" && filename.length > 0) {
		const finalFilename = filename;
		const outputPath = path.join(process.cwd(), finalFilename);

		await fs.writeFile(outputPath, html, "utf-8");

		return outputPath;
	}

	return html;
}

async function bundleClientToString(): Promise<string> {
	const result = await esbuild.build({
		entryPoints: [path.join(process.cwd(), "src", "web", "client.tsx")],
		bundle: true,
		minify: true,
		platform: "browser",
		format: "esm",
		write: false,
		jsx: "automatic"
	});

	return result.outputFiles[0].text;
}
