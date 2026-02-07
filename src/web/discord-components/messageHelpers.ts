export function getAttachmentKind(name?: string, url?: string): string {
	const target = (name || url || "").toLowerCase();
	if (/(\.mp3|\.wav|\.flac|\.ogg|\.m4a|\.aac|\.opus)$/.test(target)) return "audio";
	if (
		/(\.js|\.ts|\.tsx|\.jsx|\.json|\.py|\.java|\.c|\.cpp|\.cs|\.rb|\.php|\.go|\.rs|\.swift|\.kt|\.kts|\.sh|\.ps1|\.bat|\.sql|\.html|\.css|\.scss|\.sass)$/.test(
			target
		)
	)
		return "code";
	return "document";
}

export function formatFileSize(size?: number, human?: string): string {
	if (typeof size === "number") {
		const kb = size / 1024;
		if (kb < 1024) return `${kb.toFixed(2)} KB`;
		return `${(kb / 1024).toFixed(2)} MB`;
	}
	return human || "";
}

export function isImageUrl(url?: string): boolean {
	if (!url) return false;
	return /\.(png|jpe?g|gif|webp|svg|bmp|avif)(\?|$)/i.test(url);
}

export function isAudioUrl(url?: string): boolean {
	if (!url) return false;
	return /\.(mp3|wav|ogg|m4a|flac|aac|weba)(\?|$)/i.test(url);
}

export function isVideoUrl(url?: string): boolean {
	if (!url) return false;
	return /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(url);
}

export function extractFilenameFromUrl(url?: string): string | undefined {
	if (!url) return undefined;
	try {
		const u = new URL(url, window.location.origin);
		let p = u.pathname || "";
		if (p.endsWith("/")) p = p.slice(0, -1);
		const last = p.split("/").pop() || "";
		return last ? decodeURIComponent(last) : undefined;
	} catch (e) {
		const parts = url.split("?")[0].split("/");
		const last = parts.pop() || "";
		return last ? decodeURIComponent(last) : undefined;
	}
}

export function sanitizeMarkdownString(s: string | unknown): string | unknown {
	return typeof s === "string" ? s.replace(/[\u200B\u200C\u200D\uFEFF\u2060\u200E\u200F\u00AD]/g, "") : s;
}

export function timeAgo(d: Date): string {
	const diff = Math.floor((Date.now() - d.getTime()) / 1000);
	if (Math.abs(diff) < 60) return `${Math.abs(diff)}s ago`;
	if (Math.abs(diff) < 3600) return `${Math.round(Math.abs(diff) / 60)}m ago`;
	if (Math.abs(diff) < 86400) return `${Math.round(Math.abs(diff) / 3600)}h ago`;
	return d.toLocaleString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}
