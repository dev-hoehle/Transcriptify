import React from "react";
import hljs from "highlight.js/lib/common";
import { buildEmojiCdnUrl } from "../../helpers/cdnHelpers";
import { parseDiscordTimestamp, escapeHtml, splitFencedCodeBlocks, resolveChannelNameGlobal } from "./markdownUtils";
import type { MarkdownToken } from "../../types/markdown";

let __parseMarkdownId: number = 0;

function normalizeCodeLang(lang?: string): string | undefined {
	if (!lang) return undefined;
	const s = lang.toLowerCase();
	if (s === "py") return "python";
	if (s === "js") return "javascript";
	if (s === "ts") return "typescript";
	if (s === "jsx") return "javascript";
	if (s === "tsx") return "typescript";
	return s;
}

function getHighlightedHtml(code: string, lang?: string): string {
	const normalized = normalizeCodeLang(lang);
	const useLang = normalized && hljs.getLanguage(normalized) ? normalized : undefined;
	const result = useLang ? hljs.highlight(code, { language: useLang, ignoreIllegals: true }) : hljs.highlightAuto(code);
	return result.value || escapeHtml(code);
}

function Spoiler({ children }: { children: React.ReactNode }) {
	const [revealed, setRevealed] = React.useState(false);
	return (
		<span
			className="rounded px-0.5 cursor-pointer transition-colors"
			style={{
				backgroundColor: revealed ? "#2b2d31" : "#202225",
				color: revealed ? "#dcddde" : "transparent",
				userSelect: revealed ? "text" : "none"
			}}
			onClick={() => setRevealed(!revealed)}
			title={revealed ? "Hide" : "Click to reveal spoiler"}
		>
			{children}
		</span>
	);
}

function renderTokens(tokens: MarkdownToken[], keyBase = 0): React.ReactNode[] {
	const nodes: React.ReactNode[] = [];
	tokens.forEach((t, i) => {
		const key = `${keyBase}-${i}`;
		const rawVal = t.value ?? "";
		let v: string = "";
		if (typeof rawVal === "string") {
			v = rawVal;
		} else if (rawVal && typeof rawVal === "object") {
			v = (rawVal as any).name || (rawVal as any).text || (rawVal as any).value || "";
		}
		if (rawVal && typeof rawVal === "object" && Array.isArray((rawVal as any).tokens)) {
			nodes.push(<React.Fragment key={key}>{renderTokens((rawVal as any).tokens as MarkdownToken[], Number(`${keyBase}${i}`))}</React.Fragment>);
			return;
		}

		switch (t.type) {
			case "text":
				nodes.push(v);
				break;
			case "strike":
			case "s":
			case "strikethrough":
			case "del":
			case "deleted":
				nodes.push(
					<s key={key} style={{ textDecoration: "line-through", opacity: 0.8 }}>
						{v}
					</s>
				);
				break;
			case "inlineCode":
				nodes.push(
					<code key={key} className="bg-[#1e1f22] text-[#dbdee1] px-1 rounded text-[0.875rem] font-mono">
						{v}
					</code>
				);
				break;
			case "spoiler":
				nodes.push(<Spoiler key={key}>{v}</Spoiler>);
				break;
			case "codeBlock": {
				const lang = t.meta?.lang || undefined;
				const codeContent = typeof rawVal === "string" ? rawVal : (rawVal && (rawVal as any).raw) || "";
				const langForHighlight: string = normalizeCodeLang(lang);
				const highlighted: string = getHighlightedHtml(codeContent, langForHighlight);

				nodes.push(
					<div key={key} className="relative my-2 rounded bg-[#2B2D31] border border-[#1E1F22]">
						<div className="absolute top-1 right-2 px-2 py-0.5 text-xs text-[#B5BAC1]">{lang || "code"}</div>
						<pre className="p-3 pt-6 text-sm overflow-x-auto text-[#DBDEE1]">
							<code
								className={langForHighlight ? `language-${langForHighlight} hljs` : "hljs"}
								dangerouslySetInnerHTML={{ __html: highlighted }}
							/>
						</pre>
					</div>
				);
				break;
			}
			default:
				nodes.push(v);
		}
	});
	return nodes;
}

export function parseMarkdown(
	text: unknown,
	resolvedUsers?: Record<string, { displayName?: string; username?: string }>,
	resolvedRoles?: Record<string, { name?: string; color?: string | number }>,
	resolvedChannels?: Record<string, { name?: string | null; guildId?: string | null }>,
	currentGuildId?: string | null
): React.ReactNode {
	if (!text && text !== 0) return null;

	if (text && typeof text === "object" && Array.isArray((text as any).tokens)) {
		const tokens = (text as any).tokens as MarkdownToken[];
		const allTextOnly = tokens.every((t) => t.type === "text");
		if (allTextOnly) {
			return parseMarkdown(tokens.map((t) => t.value ?? "").join(""), resolvedUsers, resolvedRoles, resolvedChannels, currentGuildId);
		}
		return <React.Fragment key={`pm-${++__parseMarkdownId}`}>{React.Children.toArray(renderTokens(tokens))}</React.Fragment>;
	}

	let raw: string =
		typeof text === "string"
			? text
			: text && typeof (text as any).raw === "string"
				? (text as any).raw
				: text && typeof (text as any).content === "string"
					? (text as any).content
					: text && typeof (text as any).text === "string"
						? (text as any).text
						: typeof text === "number"
							? String(text)
							: "";

	raw = raw.replace(/<@!?(\d+)>/g, (_match: string, id: string, offset: number, src: string) => {
		const resolveUserName = (map?: Record<string, { displayName?: string; username?: string }>, uid?: string): string | null => {
			if (!map || !uid) return null;
			const direct = (map as any)[uid];
			if (direct && (direct.displayName || direct.username)) return direct.displayName || direct.username || null;
			const nId = Number(uid);
			if (!Number.isNaN(nId)) {
				for (const k of Object.keys(map)) {
					if (Number(k) === nId) {
						const v = (map as any)[k];
						if (v && (v.displayName || v.username)) return v.displayName || v.username || null;
					}
				}
			}
			for (const k of Object.keys(map)) {
				if (String(k).trim() === String(uid).trim()) {
					const v = (map as any)[k];
					if (v && (v.displayName || v.username)) return v.displayName || v.username || null;
				}
			}
			return null;
		};

		const name = resolveUserName(resolvedUsers, id) || "unknown-user";
		const safe = escapeHtml(String(name));
		const nextChar = src.charAt(offset + _match.length) || "";
		const needsSpace = nextChar && !/\s/.test(nextChar);
		return `<user>${safe}</user>${needsSpace ? " " : ""}`;
	});

	raw = raw.replace(/<@&(\d+)>/g, (_match: string, roleId: string) => {
		const role = resolvedRoles?.[roleId];
		if (role && role.name) {
			return `<role${role.color && ` data-color="${role.color}"`}>${escapeHtml(String(role.name))}</role>`;
		}
		return "unknown-role";
	});

	const resolveChannelName = (map?: Record<string, { name?: string | null; guildId?: string | null }>, id?: string): string | null => {
		if (!map || !id) return null;
		const direct = (map as any)[id];
		if (direct && direct.name) return direct.name;
		const nId = Number(id);
		if (!Number.isNaN(nId)) {
			for (const k of Object.keys(map)) {
				if (Number(k) === nId) {
					const v = (map as any)[k];
					if (v && v.name) return v.name;
				}
			}
		}
		for (const k of Object.keys(map)) {
			if (String(k).trim() === String(id).trim()) {
				const v = (map as any)[k];
				if (v && v.name) return v.name;
			}
		}
		return null;
	};

	raw = raw.replace(/<#(\d+)>/g, (_match: string, channelId: string) => {
		const name = resolveChannelName(resolvedChannels, channelId);
		if (name) return `<channel data-id="${channelId}">${escapeHtml(String(name))}</channel>`;
		return `<channel data-id="${channelId}">unknown</channel>`;
	});

	raw = raw.replace(/https:\/\/discord\.com\/channels\/(\d+)\/(\d+)(?:\/(\d+))?/g, (_match: string, _guildId: string, channelId: string) => {
		const name = resolveChannelName(resolvedChannels, channelId);
		if (name) return `<channel data-id="${channelId}">${escapeHtml(String(name))}</channel>`;
		return `<channel data-id="${channelId}">unknown</channel>`;
	});
	raw = raw
		.replace(/<br\s*\/?>(\r?\n)?/gi, "\n")
		.replace(/<strong>([\s\S]*?)<\/strong>/gi, "**$1**")
		.replace(/<b>([\s\S]*?)<\/b>/gi, "**$1**")
		.replace(/<u>([\s\S]*?)<\/u>/gi, "__$1__")
		.replace(/<em>([\s\S]*?)<\/em>/gi, "*$1*")
		.replace(/<i>([\s\S]*?)<\/i>/gi, "*$1*")
		.replace(/<s>([\s\S]*?)<\/s>/gi, "~~$1~~");

	raw = raw.replace(/\\([*_~`\\_])/g, "$1");

	const linesForIndentCalc = raw.split("\n");
	let minIndent: number | null = null;
	for (const l of linesForIndentCalc) {
		if (!l.trim()) continue;
		const m = l.match(/^\s*/);
		const indent = m ? m[0].length : 0;
		if (minIndent === null || indent < minIndent) minIndent = indent;
	}
	if (minIndent && minIndent > 0) {
		raw = linesForIndentCalc.map((l: string) => (l.startsWith(" ".repeat(minIndent as number)) ? l.slice(minIndent as number) : l)).join("\n");
	}

	const segments = splitFencedCodeBlocks(raw);
	const outputNodes: React.ReactNode[] = [];

	const processTextSegment = (txt: string): React.ReactNode => {
		const lines = txt.split("\n");
		const processedLines: React.ReactNode[] = [];
		let quoteBuffer: string[] = [];

		lines.forEach((line: string, idx: number) => {
			const trimmedLine = line.trimStart();
			const isQuote = trimmedLine.startsWith(">");

			if (isQuote) {
				const quoteLine = trimmedLine.replace(/^>\s?/, "");
				quoteBuffer.push(quoteLine);
			} else {
				if (quoteBuffer.length > 0) {
					processedLines.push(
						<div key={`quote-${idx}`} className="my-1 pl-3 border-l-4 border-[#4e505880] text-[#dbdee1]">
							{quoteBuffer.map((qLine, qIdx) => (
								<React.Fragment key={qIdx}>
									{processSimpleMarkdown(qLine, resolvedChannels)}
									{qIdx < quoteBuffer.length - 1 ? <br /> : null}
								</React.Fragment>
							))}
						</div>
					);
					quoteBuffer = [];
				}

				const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
				if (headingMatch) {
					const level = headingMatch[1].length;
					const text = headingMatch[2];
					const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
					processedLines.push(
						<HeadingTag key={idx} style={{ fontWeight: 600, margin: "0.5rem 0" }}>
							{processSimpleMarkdown(text, resolvedChannels)}
						</HeadingTag>
					);
				} else if (trimmedLine.startsWith("-#")) {
					let text = trimmedLine.slice(2);
					if (text.startsWith(" ")) text = text.slice(1);
					const inner = processSimpleMarkdown(text, resolvedChannels);
					const smallContent = scaleImagesInNode(inner, true);
					processedLines.push(
						<small key={idx} style={{ fontSize: "0.875rem", opacity: 0.8 }}>
							<span>{smallContent}</span>
						</small>
					);
					if (idx < lines.length - 1) processedLines.push(<br key={`br-${idx}`} />);
				} else if (trimmedLine.startsWith("- ")) {
					const text = trimmedLine.slice(2);
					processedLines.push(
						<li key={idx} style={{ marginLeft: "1.5rem" }}>
							{processSimpleMarkdown(text, resolvedChannels)}
						</li>
					);
				} else {
					processedLines.push(
						<React.Fragment key={idx}>
							{processSimpleMarkdown(line, resolvedChannels)}
							{idx < lines.length - 1 ? <br /> : null}
						</React.Fragment>
					);
				}
			}
		});

		if (quoteBuffer.length > 0) {
			processedLines.push(
				<div key="quote-end" className="my-1 pl-3 border-l-4 border-[#4e505880] text-[#dbdee1]">
					{quoteBuffer.map((qLine, qIdx) => (
						<React.Fragment key={qIdx}>
							{processSimpleMarkdown(qLine, resolvedChannels)}
							{qIdx < quoteBuffer.length - 1 ? <br /> : null}
						</React.Fragment>
					))}
				</div>
			);
		}

		return <>{React.Children.toArray(processedLines)}</>;
	};

	segments.forEach((seg, sIdx) => {
		if (seg.type === "text") {
			outputNodes.push(<React.Fragment key={`seg-${sIdx}`}>{processTextSegment(seg.value)}</React.Fragment>);
		} else if (seg.type === "code") {
			const lang = seg.lang;
			const code = seg.value || "";
			const codeText = code || "";
			const detectedLang = (lang || "").toLowerCase();
			const langForHighlight = normalizeCodeLang(detectedLang);
			const highlighted = getHighlightedHtml(codeText, langForHighlight);

			outputNodes.push(
				<div key={`code-${sIdx}`} className="relative my-2 rounded bg-[#2B2D31] border border-[#1E1F22]">
					<div className="absolute top-1 right-2 px-2 py-0.5 text-xs text-[#B5BAC1]">{lang || "code"}</div>
					<pre className="p-3 pt-6 text-sm overflow-x-auto text-[#DBDEE1]">
						<code className={langForHighlight ? `language-${langForHighlight} hljs` : "hljs"} dangerouslySetInnerHTML={{ __html: highlighted }} />
					</pre>
				</div>
			);
		}
	});

	return <React.Fragment key={`pm-${++__parseMarkdownId}`}>{React.Children.toArray(outputNodes)}</React.Fragment>;
}

function processSimpleMarkdown(line: string, resolvedChannels?: Record<string, { name?: string | null; guildId?: string | null }>): React.ReactNode {
	const timestampMatches: Array<{ timestamp: string; style: string; formatted: string }> = [];
	const processed: string = line.replace(/<t:(\d+)(?::([tTdDfFR]))?>/g, (match, timestamp, style) => {
		const placeholder: string = `__TIMESTAMP_${timestampMatches.length}__`;
		timestampMatches.push({ timestamp, style: style || "f", formatted: parseDiscordTimestamp(parseInt(timestamp, 10), style || "f") });
		return placeholder;
	});

	const regex: RegExp =
		/(`[^`]+`)|(\|\|([^|]+)\|\|)|(~~(.+?)~~)|(\*\*\*(.+?)\*\*\*)|(\*\*(.+?)\*\*)|(__TIMESTAMP_(\d+)__)|(__([\s\S]+?)__)|\*(.+?)\*|(<\/([A-Za-z0-9_-]+):(\d+)>)|(<user>[^<]+<\/user>)|(<role[^>]*>[^<]+<\/role>)|(<channel[^>]*>[^<]+<\/channel>)/g;
	let lastIndex: number = 0;
	let match: RegExpExecArray | null;
	const parts: React.ReactNode[] = [];

	while ((match = regex.exec(processed)) !== null) {
		if (match.index > lastIndex)
			parts.push(<React.Fragment key={`text-${lastIndex}`}>{processLinks(processed.substring(lastIndex, match.index))}</React.Fragment>);

		if (match[1]) {
			const code = match[1].slice(1, -1);
			parts.push(
				<code key={match.index} className="bg-[#1e1f22] text-[#dbdee1] px-1 rounded text-[0.875rem] font-mono">
					{code}
				</code>
			);
		} else if (match[2]) {
			const text = match[3];
			parts.push(<Spoiler key={match.index}>{parseInline(text)}</Spoiler>);
		} else if (match[4]) {
			const text = match[5];
			parts.push(
				<s key={match.index} style={{ textDecoration: "line-through", opacity: 0.8 }}>
					{parseInline(text)}
				</s>
			);
		} else if (match[6]) {
			const text = match[7];
			parts.push(
				<strong key={match.index} style={{ fontWeight: 600 }}>
					<em style={{ fontStyle: "italic" }}>{parseInline(text)}</em>
				</strong>
			);
		} else if (match[8]) {
			const text = match[9];
			parts.push(
				<strong key={match.index} style={{ fontWeight: 600 }}>
					{parseInline(text)}
				</strong>
			);
		} else if (match[10]) {
			const idx = parseInt(match[11], 10);
			const { formatted } = timestampMatches[idx];
			parts.push(
				<span key={match.index} className="bg-[#5865f21a] text-[#00a8fc] px-0.5 rounded cursor-default" title={formatted}>
					{formatted}
				</span>
			);
		} else if (match[12]) {
			const text = match[13];
			parts.push(
				<u key={match.index} style={{ textDecoration: "underline", textDecorationThickness: "1px" }}>
					{parseInline(text)}
				</u>
			);
		} else if (match[14]) {
			const text = match[14].slice(1, -1);
			parts.push(
				<em key={match.index} style={{ fontStyle: "italic" }}>
					{parseInline(text)}
				</em>
			);
		} else if (match[15]) {
			const commandName = match[16];
			parts.push(
				<span
					key={match.index}
					className="inline-flex items-center rounded px-2 py-0.5 text-sm font-medium mr-1"
					style={{ backgroundColor: "#1d193f", color: "#9697ec" }}
				>
					{`/${commandName}`}
				</span>
			);
		} else if (match[18]) {
			const userTag = match[18];
			let userName = userTag.replace(/<\/?user>/g, "");
			userName = String(userName).replace(/\s+/g, " ").trim();
			const display = `@${userName}`;
			parts.push(
				<span
					key={match.index}
					className="bg-[#5865f233] text-[#c9d1ff] px-0.5 rounded cursor-pointer hover:bg-[#5865f24d] transition-colors"
					style={{ fontWeight: 500 }}
				>
					{display}
				</span>
			);
			try {
				const nextChar = processed.charAt(regex.lastIndex) || "";
				if (nextChar && !/\s/.test(nextChar)) {
					parts.push(<React.Fragment key={`sp-${match.index}`}> </React.Fragment>);
				}
			} catch (_) {}
		} else if (match[19]) {
			const roleTag = match[19];
			const colorMatch = roleTag.match(/data-color="([^"]+)"/);
			const roleName = roleTag.replace(/<role[^>]*>|<\/role>/g, "");

			if (colorMatch) {
				const rawColor = colorMatch[1];
				let colorInt: number = 0;
				if (/^#?[0-9a-fA-F]{6}$/.test(rawColor)) {
					colorInt = parseInt(rawColor.replace("#", ""), 16);
				} else if (/^0x[0-9a-fA-F]+$/.test(rawColor)) {
					colorInt = parseInt(rawColor.replace("0x", ""), 16);
				} else {
					colorInt = parseInt(rawColor, 10) || 0;
				}

				const r = (colorInt >> 16) & 0xff;
				const g = (colorInt >> 8) & 0xff;
				const b = colorInt & 0xff;
				const textColor = `rgb(${r}, ${g}, ${b})`;
				const bgColor = `rgba(${r}, ${g}, ${b}, 0.12)`;

				parts.push(
					<span
						key={match.index}
						className="px-0.5 rounded cursor-pointer transition-opacity hover:opacity-80"
						style={{ color: textColor, backgroundColor: bgColor, fontWeight: 500 }}
					>
						{`@${roleName}`}
					</span>
				);
			} else {
				parts.push(<span key={match.index}>{`@${roleName}`}</span>);
			}
		} else if (match[20]) {
			const channelTag = match[20];
			const idMatch = channelTag.match(/data-id=\"([^\"]+)\"/);
			const channelIdAttr = idMatch ? idMatch[1] : undefined;
			const innerText = channelTag.replace(/<channel[^>]*>|<\/channel>/g, "");
			let displayName = innerText;
			if (channelIdAttr) {
				const resolved = resolveChannelNameGlobal(resolvedChannels, channelIdAttr);
				if (resolved) displayName = `#${resolved}`;
			}
			parts.push(
				<span
					key={match.index}
					className="bg-[#5865f21a] text-[#00a8fc] px-0.5 rounded cursor-pointer hover:bg-[#5865f233] transition-colors"
					style={{ fontWeight: 500 }}
					data-channel-id={channelIdAttr}
				>
					{displayName}
				</span>
			);
		}

		lastIndex = regex.lastIndex;
	}

	if (lastIndex < processed.length) parts.push(<React.Fragment key={`text-${lastIndex}`}>{processLinks(processed.substring(lastIndex))}</React.Fragment>);

	return <>{React.Children.toArray(parts)}</>;
}

function processLinks(str: string): React.ReactNode {
	const mdRegex = /\[([^\]]+)\]\(\s*(?:<\s*(https?:\/\/[^>\s]+)\s*>|(https?:\/\/[^\s)]+))\s*\)/g;
	const segments: React.ReactNode[] = [];
	let lastIdx: number = 0;
	let mdMatch: RegExpExecArray | null;

	while ((mdMatch = mdRegex.exec(str)) !== null) {
		if (mdMatch.index > lastIdx) {
			segments.push(<React.Fragment key={`seg-${lastIdx}`}>{processBareLinks(str.substring(lastIdx, mdMatch.index))}</React.Fragment>);
		}
		const label = mdMatch[1];
		const url = (mdMatch[2] || mdMatch[3]) as string;
		if (!url || !/^https?:\/\//i.test(url)) {
			segments.push(<React.Fragment key={`mdlink-${mdMatch.index}`}>{label}</React.Fragment>);
		} else {
			segments.push(
				<a key={`mdlink-${mdMatch.index}`} href={url} style={{ color: "blue" }} target="_blank" rel="noreferrer">
					{label}
				</a>
			);
		}
		lastIdx = mdRegex.lastIndex;
	}
	if (lastIdx < str.length) {
		segments.push(<React.Fragment key={`seg-${lastIdx}`}>{processBareLinks(str.substring(lastIdx))}</React.Fragment>);
	}
	return <>{React.Children.toArray(segments)}</>;
}

function processBareLinks(str: string): React.ReactNode {
	const urlRegex: RegExp = /<\s*(https?:\/\/[^>\s]+)\s*>|(https?:\/\/[^\s)]+)/g;
	const parts: React.ReactNode[] = [];
	let last: number = 0;
	let match: RegExpExecArray | null;
	while ((match = urlRegex.exec(str)) !== null) {
		if (match.index > last) parts.push(<React.Fragment key={`text-${last}`}>{str.substring(last, match.index)}</React.Fragment>);
		const url = (match[1] || match[2]) as string;

		const isSticker = /\/stickers\/\d+\.webp(\?.*)?$/i.test(url) || url.includes("/stickers/");
		if (isSticker) {
			parts.push(<img key={`sticker-${match.index}`} src={url} alt="sticker" className="inline h-10 w-10 align-text-bottom mr-0.5" />);
		} else {
			parts.push(
				<a key={`u-${match.index}`} href={url} style={{ color: "blue" }} target="_blank" rel="noreferrer">
					{url}
				</a>
			);
		}
		last = urlRegex.lastIndex;
	}
	if (last < str.length) parts.push(<React.Fragment key={`text-${last}`}>{str.substring(last)}</React.Fragment>);
	const rendered = parts.map((p, i) => {
		if (typeof p === "string") {
			return <React.Fragment key={`emoji-${i}`}>{processEmojis(p as string)}</React.Fragment>;
		}
		if (React.isValidElement(p) && p.props && typeof p.props.children === "string") {
			return <React.Fragment key={`emoji-frag-${i}`}>{processEmojis(p.props.children as string)}</React.Fragment>;
		}
		return p;
	});
	return <>{React.Children.toArray(rendered)}</>;
}

function processEmojis(str: string): React.ReactNode {
	const nodes: React.ReactNode[] = [];
	const emojiRegex = /<(a)?:([^:>]+):(\d+)>/g;
	let last: number = 0;
	let m: RegExpExecArray | null;
	while ((m = emojiRegex.exec(str)) !== null) {
		if (m.index > last) nodes.push(str.substring(last, m.index));
		const animated = !!m[1];
		const name = m[2];
		const id = m[3];
		const src = buildEmojiCdnUrl(id, animated, 96) || "";
		if (src) {
			nodes.push(<img key={`e-${id}-${m.index}`} src={src} alt={name} className="inline h-5 w-5 align-text-bottom mr-0.5" />);
		}
		last = emojiRegex.lastIndex;
	}
	if (last < str.length) nodes.push(str.substring(last));
	return <>{React.Children.toArray(nodes)}</>;
}

function scaleImagesInNode(node: React.ReactNode, small: boolean): React.ReactNode {
	if (!small) return node;
	if (node === null || node === undefined) return node;
	if (typeof node === "string" || typeof node === "number") return node;
	if (Array.isArray(node)) {
		const mapped = node.map((n, i) => {
			const scaled = scaleImagesInNode(n, small);
			if (Array.isArray(scaled)) {
				return (React.Children.toArray(scaled) as any).map((c: any, j: number) =>
					React.isValidElement(c) ? React.cloneElement(c, { key: `si-${i}-${j}` }) : React.createElement(React.Fragment, { key: `si-${i}-${j}` }, c)
				);
			}
			if (React.isValidElement(scaled)) {
				if ((scaled as any).key == null) return React.cloneElement(scaled, { key: `si-${i}` });
				return scaled;
			}
			return React.createElement(React.Fragment, { key: `si-txt-${i}` }, scaled);
		});

		return React.Children.toArray((mapped as any).flat());
	}
	if (React.isValidElement(node)) {
		const el = node as React.ReactElement<any>;
		const props = el.props || {};
		const children = props.children;
		const newChildren = scaleImagesInNode(children, small);
		if (el.type === React.Fragment) {
			return <>{newChildren}</>;
		}
		const isImageLike = el.type === "img" || (props && typeof props.src === "string");
		if (isImageLike) {
			const newStyle = Object.assign({}, props.style || {}, { height: "0.875rem", width: "0.875rem" });
			return React.cloneElement(el, Object.assign({}, props, { style: newStyle }));
		}

		return React.cloneElement(el, Object.assign({}, props), newChildren);
	}
	return node;
}

function parseInline(text: string): React.ReactNode {
	const nodes: React.ReactNode[] = [];
	const regex = /(~~([\s\S]+?)~~)|(\*\*__|__\*\*)([\s\S]+?)(__\*\*|\*\*__)|__([\s\S]+?)__|(\*\*\*([\s\S]+?)\*\*\*)|(\*\*(.+?)\*\*)|(\*([^*]+)\*)/g;
	let lastIndex: number = 0;
	let m: RegExpExecArray | null;
	while ((m = regex.exec(text)) !== null) {
		if (m.index > lastIndex) nodes.push(<React.Fragment key={`link-${lastIndex}`}>{processLinks(text.substring(lastIndex, m.index))}</React.Fragment>);

		if (m[1]) {
			// ~~strike~~
			nodes.push(
				<s key={`st-${m.index}`} style={{ textDecoration: "line-through", opacity: 0.8 }}>
					{parseInline(m[2])}
				</s>
			);
		} else if (m[3]) {
			// **__bold+underline__** or __**__ combo
			nodes.push(
				<strong key={`bu-${m.index}`} style={{ fontWeight: 600 }}>
					<u style={{ textDecoration: "underline" }}>{processLinks(m[4])}</u>
				</strong>
			);
		} else if (m[6]) {
			// __underline__
			nodes.push(
				<u key={`u-${m.index}`} style={{ textDecoration: "underline", textDecorationThickness: "1px" }}>
					{processLinks(m[6])}
				</u>
			);
		} else if (m[7]) {
			// ***bold italic***
			nodes.push(
				<strong key={`bui-${m.index}`} style={{ fontWeight: 600 }}>
					<em>{processLinks(m[8])}</em>
				</strong>
			);
		} else if (m[9]) {
			// **bold**
			nodes.push(
				<strong key={`b-${m.index}`} style={{ fontWeight: 600 }}>
					{processLinks(m[10])}
				</strong>
			);
		} else if (m[11]) {
			// *italic*
			nodes.push(
				<em key={`i-${m.index}`} style={{ fontStyle: "italic" }}>
					{processLinks(m[12])}
				</em>
			);
		}
		lastIndex = regex.lastIndex;
	}

	if (lastIndex < text.length) nodes.push(<React.Fragment key={`link-${lastIndex}`}>{processLinks(text.substring(lastIndex))}</React.Fragment>);
	return <>{React.Children.toArray(nodes)}</>;
}
