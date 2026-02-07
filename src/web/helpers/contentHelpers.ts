import type React from "react";
import { parseMarkdown } from "../discord-components/utils/markdown";
import type { ResolvedUsers, ResolvedRoles } from "../types/message";
import { buildEmojiCdnUrl } from "./cdnHelpers";

export function stripDuplicateLinks(content: string, urlsToHide: Set<string>): string {
	let result = content;
	urlsToHide.forEach((url) => {
		result = result.split(url).join("");
	});
	return result;
}

export function buildEmojiUrl(id: string, animated: boolean): string {
	const url = buildEmojiCdnUrl(id, animated);
	return url || "";
}

export function extractEmojiUrls(content: string, emojiUrls?: Record<string, string>): Set<string> {
	const urls = new Set<string>();
	const emojiTokenRegex = /<(a)?:([^:>]+):(\d+)>/g;
	let match: RegExpExecArray | null;

	while ((match = emojiTokenRegex.exec(content)) !== null) {
		const animated = !!match[1];
		const id = match[3];
		const token = match[0];
		const src = emojiUrls?.[token] || buildEmojiUrl(id, animated);
		if (src) urls.add(src);
	}

	return urls;
}

export function renderContent(
	content: unknown,
	urlsToHide: Set<string>,
	emojiUrls?: Record<string, string>,
	resolvedUsers?: ResolvedUsers,
	resolvedRoles?: ResolvedRoles,
	resolvedChannels?: Record<string, { name?: string | null; guildId?: string | null }>,
	currentGuildId?: string | null
): React.ReactNode {
	if (typeof content === "string") {
		const localHide = extractEmojiUrls(content, emojiUrls);
		const text = stripDuplicateLinks(content, new Set([...urlsToHide, ...localHide]));
		return parseMarkdown(text, resolvedUsers, resolvedRoles, resolvedChannels, currentGuildId);
	}
	return parseMarkdown(content, resolvedUsers, resolvedRoles, resolvedChannels, currentGuildId);
}
