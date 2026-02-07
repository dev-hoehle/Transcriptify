import fs from "fs/promises";
import path from "path";
import { existsSync, createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import https from "https";
import { tmpdir } from "os";
import { randomBytes } from "crypto";
import sharp from "sharp";

async function downloadFile(url: string, outputDir: string, baseName: string): Promise<string | null> {
	async function _download(u: string, tempOut: string, redirects: number = 0): Promise<{ temp: string; headers: Record<string, any> } | null> {
		return await new Promise((resolve, reject) => {
			const req = https.get(u, (response) => {
				const code: number = response.statusCode || 0;
				if (code >= 300 && code < 400 && response.headers.location) {
					if (redirects >= 5) {
						reject(new Error("Too many redirects"));
						return;
					}
					const loc: string = response.headers.location as string;
					const next: string = loc.startsWith("http") ? loc : new URL(loc, u).toString();
					resolve(_download(next, tempOut, redirects + 1));
					return;
				}

				if (code !== 200) {
					reject(new Error(`HTTP ${code}`));
					return;
				}

				const file = createWriteStream(tempOut);
				pipeline(response, file)
					.then(() => resolve({ temp: tempOut, headers: response.headers }))
					.catch(reject);
			});
			req.on("error", reject);
		});
	}

	try {
		if (!existsSync(outputDir)) await fs.mkdir(outputDir, { recursive: true });
		const rand: string = randomBytes(6).toString("hex");
		const tempOut: string = path.join(tmpdir(), `asset-${Date.now()}-${rand}.tmp`);
		const result: { temp: string; headers: Record<string, any> } | null = await _download(url, tempOut, 0);
		if (!result) return null;

		const headers: Record<string, any> = result.headers || {};
		const contentType: string = (headers["content-type"] || "").toString();
		const map: Record<string, string> = {
			"image/png": ".png",
			"image/jpeg": ".jpg",
			"image/jpg": ".jpg",
			"image/gif": ".gif",
			"image/webp": ".webp",
			"image/svg+xml": ".svg",
			"application/pdf": ".pdf",
			"text/html": ".html",
			"audio/mpeg": ".mp3",
			"audio/mp3": ".mp3",
			"audio/wav": ".wav",
			"video/mp4": ".mp4",
			"video/webm": ".webm"
		};

		let parsedExt: string = path.extname(baseName) || "";
		let ext: string = parsedExt;

		if (!ext) {
			try {
				const u2: URL = new URL(url);
				const pExt: string = path.extname(u2.pathname || "") || "";
				if (pExt) parsedExt = pExt;
			} catch {}
		}

		if (!ext && parsedExt) {
			ext = parsedExt;
		}

		if (!ext && contentType) {
			const t: string = contentType.split(";")[0].trim().toLowerCase();
			if (map[t]) ext = map[t];
		}

		const baseOnly: string = parsedExt ? baseName.slice(0, -parsedExt.length) : baseName;
		const encodedName: string = encodeURIComponent(baseOnly) + (ext || "");
		const finalOut: string = path.join(outputDir, encodedName);

		try {
			await fs.rename(tempOut, finalOut).catch(async () => {
				await fs.copyFile(tempOut, finalOut);
				await fs.unlink(tempOut).catch(() => {});
			});

			if (finalOut.includes("%25")) {
				try {
					const alt1: string = finalOut.replace(/%25/g, "%");
					if (!existsSync(alt1)) {
						await fs.copyFile(finalOut, alt1).catch(() => {});
					}
				} catch {}
			}

			try {
				const base: string = path.basename(finalOut);
				const dir: string = path.dirname(finalOut);
				let decodedBase: string = base;
				try {
					decodedBase = decodeURIComponent(base);
				} catch {}
				if (decodedBase !== base) {
					const alt2: string = path.join(dir, decodedBase);
					if (!existsSync(alt2)) {
						await fs.copyFile(finalOut, alt2).catch(() => {});
					}
				}
			} catch {}
		} catch (e) {
			try {
				await fs.unlink(tempOut).catch(() => {});
			} catch {}
			return null;
		}

		return finalOut;
	} catch (e) {
		return null;
	}
}

function getAssetType(url: string): string {
	const imageExts: RegExp = /\.(png|jpg|jpeg|gif|webp|svg|bmp|avif)(\?|$)/i;
	const videoExts: RegExp = /\.(mp4|mov|webm|avi|mkv|flv|wmv)(\?|$)/i;
	const audioExts: RegExp = /\.(mp3|wav|ogg|m4a|flac|aac|weba)(\?|$)/i;
	const profileExts: RegExp = /\/avatars\/|\/user-content\/|\/emojis\//i;

	if (profileExts.test(url)) return "profiles";
	if (imageExts.test(url)) return "images";
	if (videoExts.test(url)) return "videos";
	if (audioExts.test(url)) return "audio";
	return "files";
}

function getFilenameFromUrl(url: string): string {
	try {
		const u: URL = new URL(url);
		const pathname: string = (u.pathname || "") + (u.search || "");
		const parts: string[] = pathname.split("/");
		const filename: string | undefined = parts[parts.length - 1];
		if (filename && filename.length > 0) {
			return filename.split("?")[0] || `file_${Date.now()}`;
		}
	} catch {}
	return `file_${Date.now()}`;
}

function decodeHtmlEntities(value: string): string {
	return value.replace(/&amp;/g, "&").replace(/&#38;/g, "&");
}

function normalizeExternalUrl(url: string): string {
	try {
		const newUrl = new URL(url);
		if (/images-ext(?:-[^.]*)?\.discordapp\.net/i.test(newUrl.hostname)) {
			const decoded: string = decodeURIComponent((newUrl.pathname || "") + (newUrl.search || ""));

			let idx: number = decoded.lastIndexOf("/https/");
			if (idx === -1) idx = decoded.lastIndexOf("/http/");
			if (idx !== -1) {
				let inner = decoded.slice(idx + 1);
				inner = inner.replace(/^https?\//i, (m) => m.replace("/", "://"));
				return inner;
			}

			const find: RegExpMatchArray = decoded.match(/https?:\/\/[^\s"'<>]+/i);
			if (find && find[0]) return find[0];
		}
	} catch {}
	return url;
}

export class AssetManager {
	private urlMap: Map<string, string> = new Map();
	private assetsDir: string;
	private compression?: number;

	constructor(assetsDir: string = "assets", opts?: { compression?: number }) {
		this.assetsDir = assetsDir;
		this.compression = opts?.compression;
	}

	async initialize(): Promise<void> {
		if (!existsSync(this.assetsDir)) {
			await fs.mkdir(this.assetsDir, { recursive: true });
		}
	}

	async downloadAssets(data: unknown): Promise<void> {
		const urls: Set<string> = this.extractDiscordUrls(data);
		for (const url of urls) {
			if (!this.urlMap.has(url)) {
				const cleanedUrl: string = decodeHtmlEntities(url);
				const type: string = getAssetType(cleanedUrl);
				const rawFilename: string = getFilenameFromUrl(cleanedUrl);
				const typeDir: string = path.join(this.assetsDir, type);
				if (!existsSync(typeDir)) {
					await fs.mkdir(typeDir, { recursive: true });
				}

				const downloadedPath = await downloadFile(normalizeExternalUrl(cleanedUrl), typeDir, rawFilename);
				if (downloadedPath) {
					let finalFilename: string = path.basename(downloadedPath);
					let finalSavedPath: string = downloadedPath;

					const imageExts: RegExp = /\.(png|jpg|jpeg|gif|webp|svg|bmp|avif)(\?|$)/i;
					if (this.compression && this.compression > 0 && imageExts.test(finalFilename)) {
						try {
							const q = Math.max(1, Math.min(100, Math.floor(this.compression)));
							const dirName: string = path.dirname(downloadedPath);
							const baseOnlyName: string = path.basename(downloadedPath, path.extname(downloadedPath));
							let tmpOut: string = path.join(dirName, `${baseOnlyName}.webp`);
							let uniqueTmpOut: string = tmpOut;
							let idx: number = 0;
							while (existsSync(uniqueTmpOut)) {
								idx += 1;
								uniqueTmpOut = path.join(dirName, `${baseOnlyName}-${idx}.webp`);
							}
							await sharp(downloadedPath).toFormat("webp", { quality: q }).toFile(uniqueTmpOut);

							try {
								await fs.unlink(downloadedPath).catch(() => {});
							} catch {}
							finalSavedPath = uniqueTmpOut;
							finalFilename = path.basename(finalSavedPath);
						} catch (_) {}
					}

					const localPath: string = path.join("assets", type, finalFilename).replace(/\\/g, "/");
					this.urlMap.set(url, localPath);
					if (cleanedUrl !== url) this.urlMap.set(cleanedUrl, localPath);
					const baseUrl: string = cleanedUrl.split("?")[0];
					if (!this.urlMap.has(baseUrl)) this.urlMap.set(baseUrl, localPath);
				}
			}
		}
	}

	replaceUrls(data: unknown): unknown {
		if (typeof data === "string") {
			let result: string = data;
			for (const [original, local] of this.urlMap.entries()) {
				const esc = original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
				const re = new RegExp(esc + "(?:\\?[^\"'\\s>]*)?", "g");
				result = result.replace(re, local);
			}
			return result;
		}

		if (Array.isArray(data)) {
			return data.map((item) => this.replaceUrls(item));
		}

		if (data !== null && typeof data === "object") {
			const obj: Record<string, unknown> = data as Record<string, unknown>;
			const result: Record<string, unknown> = {};
			for (const [key, value] of Object.entries(obj)) {
				result[key] = this.replaceUrls(value);
			}
			return result;
		}

		return data;
	}

	private extractDiscordUrls(data: unknown, urls: Set<string> = new Set()): Set<string> {
		if (typeof data === "string") {
			const discordUrlRegex: RegExp =
				/https?:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net|images-ext(?:-[^.]*)?\.discordapp\.net)\/[^\s"<>){}[\]]+/g;
			let match: RegExpExecArray | null;
			while ((match = discordUrlRegex.exec(data)) !== null) {
				urls.add(match[0]);
			}
			return urls;
		}

		if (Array.isArray(data)) {
			for (const item of data) {
				this.extractDiscordUrls(item, urls);
			}
			return urls;
		}

		if (data !== null && typeof data === "object") {
			const obj = data as Record<string, unknown>;
			for (const value of Object.values(obj)) {
				this.extractDiscordUrls(value, urls);
			}
			return urls;
		}

		return urls;
	}
}
