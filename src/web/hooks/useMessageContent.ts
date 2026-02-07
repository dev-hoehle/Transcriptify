import { useMemo } from "react";
import { renderContent } from "../helpers/contentHelpers";
import type { UseMessageContentParams } from "../types/props";

export function useMessageContent({
	content,
	attachments,
	embeds,
	emojiUrls,
	resolvedUsers,
	resolvedRoles,
	resolvedChannels,
	channelGuildId
}: UseMessageContentParams) {
	const urlsToHide = useMemo(() => {
		const urls = new Set<string>();

		if (attachments) {
			attachments.forEach((a) => {
				if (a?.url) urls.add(a.url);
			});
		}

		if (embeds) {
			embeds.forEach((e: any) => {
				const imgUrl = e?.image?.url || e?.thumbnail?.url;
				const isEmojiEmbed = imgUrl && /cdn\.discordapp\.com\/emojis\//.test(imgUrl) && !e?.title && !e?.description && !e?.author;
				if (!isEmojiEmbed) {
					if (e?.url) urls.add(e.url);
					if (e?.image?.url) urls.add(e.image.url);
					if (e?.thumbnail?.url) urls.add(e.thumbnail.url);
				}
			});
		}

		return urls;
	}, [attachments, embeds]);

	const renderedContent = useMemo(() => {
		if (!content) return null;
		return renderContent(content, urlsToHide, emojiUrls, resolvedUsers, resolvedRoles, resolvedChannels, channelGuildId);
	}, [content, urlsToHide, emojiUrls, resolvedUsers]);

	return { renderedContent, urlsToHide };
}
