export function parseDiscordTimestamp(unixTimestamp: number, style: string = "f"): string {
	const date = new Date(unixTimestamp * 1000);

	const timeOptions: Intl.DateTimeFormatOptions = {
		hour: "numeric",
		minute: "2-digit",
		hour12: true
	};

	const shortDateOptions: Intl.DateTimeFormatOptions = {
		month: "numeric",
		day: "numeric",
		year: "numeric"
	};

	const longDateOptions: Intl.DateTimeFormatOptions = {
		month: "long",
		day: "numeric",
		year: "numeric"
	};

	switch (style) {
		case "t":
			return date.toLocaleTimeString("en-US", timeOptions);
		case "T":
			return date.toLocaleTimeString("en-US", { ...timeOptions, second: "2-digit" });
		case "d":
			return date.toLocaleDateString("en-US", shortDateOptions);
		case "D":
			return date.toLocaleDateString("en-US", longDateOptions);
		case "f":
			return `${date.toLocaleDateString("en-US", longDateOptions)} ${date.toLocaleTimeString("en-US", timeOptions)}`;
		case "F": {
			const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
			const longDate = date.toLocaleDateString("en-US", longDateOptions);
			const time = date.toLocaleTimeString("en-US", timeOptions);
			return `${dayName}, ${longDate} at ${time}`;
		}
		case "R":
			return formatRelativeTime(date);
		default:
			return `${date.toLocaleDateString("en-US", longDateOptions)} ${date.toLocaleTimeString("en-US", timeOptions)}`;
	}
}

export function formatRelativeTime(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSeconds = Math.floor(diffMs / 1000);
	const diffMinutes = Math.floor(diffSeconds / 60);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);
	const diffMonths = Math.floor(diffDays / 30);
	const diffYears = Math.floor(diffDays / 365);

	if (diffSeconds < 60) {
		return diffSeconds <= 1 ? "1 second ago" : `${diffSeconds} seconds ago`;
	} else if (diffMinutes < 60) {
		return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
	} else if (diffHours < 24) {
		return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
	} else if (diffDays < 30) {
		return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
	} else if (diffMonths < 12) {
		return diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
	} else {
		return diffYears === 1 ? "1 year ago" : `${diffYears} years ago`;
	}
}

export function escapeHtml(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function splitFencedCodeBlocks(input: string): Array<{ type: "text" | "code"; value: string; lang?: string }> {
	const segments: Array<{ type: "text" | "code"; value: string; lang?: string }> = [];
	let idx: number = 0;
	while (idx < input.length) {
		const start = input.indexOf("```", idx);
		if (start === -1) {
			segments.push({ type: "text", value: input.slice(idx) });
			break;
		}
		if (start > idx) {
			segments.push({ type: "text", value: input.slice(idx, start) });
		}
		const end = input.indexOf("```", start + 3);
		if (end === -1) {
			segments.push({ type: "text", value: input.slice(start) });
			break;
		}
		const fenceBody = input.slice(start + 3, end);
		const lineBreakIndex = fenceBody.indexOf("\n");
		if (lineBreakIndex === -1) {
			const lang = fenceBody.trim();
			segments.push(lang ? { type: "code", value: "", lang } : { type: "code", value: "" });
		} else if (fenceBody.startsWith("\n") || fenceBody.startsWith("\r\n")) {
			const code = fenceBody.replace(/^\r?\n/, "");
			segments.push({ type: "code", value: code });
		} else {
			const langLine = fenceBody.slice(0, lineBreakIndex).trim();
			const code = fenceBody.slice(lineBreakIndex + 1);
			segments.push(langLine ? { type: "code", value: code, lang: langLine } : { type: "code", value: code });
		}
		idx = end + 3;
	}
	return segments;
}

export const resolveChannelNameGlobal = (map?: Record<string, { name?: string | null; guildId?: string | null }>, id?: string): string | null => {
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
