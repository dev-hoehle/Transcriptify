import type { MessageProps } from "../types/message";
import type { Reaction } from "../types/reaction";
import { buildAvatarUrl } from "../helpers/avatarHelpers";
import { buildEmojiCdnUrl } from "../helpers/cdnHelpers";

export function buildAuthor(m: any, resolvedUsers: Record<string, any>) {
	let authorData = m.author;
	const originalAuthorRef = typeof m.author === "string" ? m.author : undefined;

	if (typeof authorData === "string") {
		authorData = resolvedUsers[authorData] || { id: authorData };
	}

	const authorId = authorData?.id || originalAuthorRef;
	const name = authorData?.name || authorData?.username || "Unknown";
	const avatar = authorData?.avatar;
	let url = avatar;
	if (typeof avatar === "string" && authorId) {
		url = buildAvatarUrl(String(authorId), avatar);
	}

	return {
		id: String(authorId || "0"),
		name: name || "Unknown",
		username: authorData?.username || name || "Unknown",
		avatar: url,
		bot: authorData?.bot || false,
		verified: authorData?.verified || false,
		color: authorData?.color || undefined,
		guildTag: authorData?.guildTag || undefined
	};
}

export function buildReactions(reactions: any[] | undefined): Reaction[] | undefined {
	if (!reactions?.length) return undefined;

	return reactions.map((r: any) => {
		const emoji = r.emoji || {};
		const emojiId = emoji.id;
		const emojiName = emoji.name || "?";
		let emojiUrl = emoji.url as string | undefined;

		if (emojiId && !emoji.animated) {
			emojiUrl = buildEmojiCdnUrl(String(emojiId), false, 96);
		} else if (emojiId && emoji.animated) {
			emojiUrl = buildEmojiCdnUrl(String(emojiId), true, 96);
		}

		return {
			emoji: emojiName,
			emojiUrl: emojiUrl || undefined,
			count: r.count || 1
		};
	});
}

export function buildReplyTo(m: any, byOriginal: Map<string, any>) {
	if (!m.replyTo && !m.referencedMessageId) return undefined;

	const replyId = m.replyTo?.id || String(m.referencedMessageId);
	if (!replyId) return undefined;

	const resolved = byOriginal.get(replyId);
	if (resolved) {
		return {
			id: replyId,
			content: resolved.content,
			author: resolved.author
		};
	}

	return {
		id: replyId,
		content: "Message not in transcript",
		author: { name: "Unknown User", username: "unknown" }
	};
}

export function mapMessage(
	m: any,
	byOriginal: Map<string, any>,
	resolvedUsers: Record<string, any> = {},
	resolvedRoles: Record<string, any> = {}
): MessageProps {
	let forwardedFrom: any = null;
	let forwardedMessage: any = null;

	if (m.forwarded) {
		const orig = m.forwarded.original || null;
		forwardedFrom = {
			id: m.forwarded.fromMessageId || orig?.id,
			name: m.forwarded.fromMessageId ? `Message ${m.forwarded.fromMessageId}` : undefined
		};
		if (orig) {
			forwardedMessage = {
				id: String(orig.id || m.forwarded.fromMessageId || "fwd"),
				content: orig.content || "",
				embeds: orig.embeds || [],
				attachments: (orig.attachments || []).map((a: any) => a?.url || a).filter(Boolean),
				stickers: orig.stickers || []
			};
		}
	}

	return {
		id: String(m.id || "0"),
		author: buildAuthor(m, resolvedUsers),
		content: m.content || "",
		timestamp: m.timestamp || m.createdAt,
		editedAt: m.edited_timestamp || m.editedAt ? new Date(m.edited_timestamp || m.editedAt).toISOString() : null,
		reactions: buildReactions(m.reactions),
		replyTo: buildReplyTo(m, byOriginal),
		interaction: m.interaction,
		poll: m.poll,
		attachments: m.attachments,
		embeds: m.embeds,
		stickers: m.stickers,
		forwardedFrom,
		forwardedMessage,
		messageType: m.messageType,
		pinned: m.pinned || false,
		buttons: ((m.actionRows || []).flatMap((ar: any) => ar.components || []).filter((c: any) => c && c.type === 2) || []).length
			? (m.actionRows || []).flatMap((ar: any) => ar.components || []).filter((c: any) => c && c.type === 2)
			: m.buttons || [],
		selects: ((m.actionRows || []).flatMap((ar: any) => ar.components || []).filter((c: any) => c && c.type === 8) || []).length
			? (m.actionRows || []).flatMap((ar: any) => ar.components || []).filter((c: any) => c && c.type === 8)
			: m.selects || [],
		resolvedUsers,
		resolvedRoles,
		referencedMessageId: m.referencedMessageId || m.referenced_message_id || undefined
	};
}
