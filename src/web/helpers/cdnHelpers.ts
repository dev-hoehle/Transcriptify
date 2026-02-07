import type { TranscriptCdnConfig } from "../types/props";

function getTranscriptCdnConfig(): TranscriptCdnConfig | undefined {
	if (typeof window !== "undefined") {
		return (window as unknown as { __TRANSCRIPT_DATA__?: TranscriptCdnConfig }).__TRANSCRIPT_DATA__;
	}
	return (globalThis as unknown as { __TRANSCRIPT_DATA__?: TranscriptCdnConfig }).__TRANSCRIPT_DATA__;
}

export function getCdnBase(): string | undefined {
	const data = getTranscriptCdnConfig();
	if (data?.cdnBase && typeof data.cdnBase === "string" && data.cdnBase.length > 0) {
		return data.cdnBase;
	}
	return undefined;
}

export function getMediaBase(): string | undefined {
	const data = getTranscriptCdnConfig();
	if (data?.mediaBase && typeof data.mediaBase === "string" && data.mediaBase.length > 0) {
		return data.mediaBase;
	}
	return undefined;
}

export function buildEmojiCdnUrl(id: string, animated: boolean, size: number = 96): string | undefined {
	const base = getCdnBase();
	const ext = animated ? "gif" : "webp";
	if (base) {
		return `${base}/emojis/${id}.${ext}?size=${size}&animated=${animated}`;
	}

	return `https://cdn.discordapp.com/emojis/${id}.${ext}?size=${size}&animated=${animated}`;
}

export function buildStickerCdnUrl(id: string, size: number = 160): string | undefined {
	const base = getMediaBase();
	if (!base) return undefined;
	return `${base}/stickers/${id}.webp?size=${size}&quality=lossless`;
}

export function buildAvatarCdnUrl(userId: string, avatarHash: string): string | undefined {
	const base = getCdnBase();
	if (!base) return undefined;
	const ext = avatarHash.startsWith("a_") ? ".gif" : ".png";
	return `${base}/avatars/${userId}/${avatarHash}${ext}?size=128`;
}
