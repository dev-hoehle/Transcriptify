import type { ResolvedUsers } from "../types/message";
import { extractEmojiUrls, stripDuplicateLinks } from "./contentHelpers";

export function renderContent(content: unknown, urlsToHide: Set<string>, emojiUrls?: Record<string, string>, resolvedUsers?: ResolvedUsers): string {
	if (typeof content === "string") {
		return renderMentionsAsString(stripDuplicateLinks(content, new Set([...urlsToHide, ...extractEmojiUrls(content, emojiUrls)])), resolvedUsers);
	}

	return String(content || "");
}

function renderMentionsAsString(text: string, resolvedUsers?: ResolvedUsers): string {
	return text.replace(/<@!?(\d+)>/g, (_, id) => {
		return `@${resolvedUsers?.[id]?.displayName || id}`;
	});
}
