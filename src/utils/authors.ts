import type { AuthorData, ForwardedOriginal, ForwardedData } from "../types/entities";

export function buildSystemAuthor(messageId: string, messageType?: number): AuthorData {
	return {
		id: `system:${messageId}`,
		username: `System${messageType ? ` (type ${messageType})` : ""}`,
		bot: false,
		color: null,
		verified: null
	};
}

export function buildForwardedOriginal(message: any): ForwardedOriginal {
	const rawEmbeds: any[] = Array.isArray(message.embeds)
		? message.embeds
		: typeof message.embeds?.values === "function"
			? Array.from(message.embeds.values())
			: [];

	const rawAttachments: any[] = Array.isArray(message.attachments)
		? message.attachments
		: typeof message.attachments?.values === "function"
			? Array.from(message.attachments.values())
			: [];

	const rawStickers: any[] = Array.isArray(message.stickers)
		? message.stickers
		: typeof message.stickers?.values === "function"
			? Array.from(message.stickers.values())
			: [];

	return {
		id: message.id ?? null,
		content: message.content ?? "",
		author: message.author?.id ?? null,
		createdAt: message.createdAt ? new Date(message.createdAt).toISOString() : null,
		embeds: rawEmbeds.map((e: any): any => ({
			title: e.title ?? null,
			description: e.description ?? null,
			url: e.url ?? null,
			timestamp: e.timestamp ? new Date(e.timestamp).toISOString() : null,
			color:
				typeof e.hexColor === "string"
					? e.hexColor
					: typeof e.color === "string"
						? e.color
						: typeof e.color === "number"
							? `#${e.color.toString(16).padStart(6, "0")}`
							: null,
			footer: e.footer ? { text: e.footer.text ?? null, iconUrl: e.footer.iconURL ?? null } : null,
			image: e.image
				? {
						url: e.image.proxyURL ?? e.image.proxy_url ?? e.image.url ?? null,
						width: e.image?.width ?? null,
						height: e.image?.height ?? null
					}
				: null,
			thumbnail: e.thumbnail
				? {
						url: e.thumbnail.proxyURL ?? e.thumbnail.proxy_url ?? e.thumbnail.url ?? null,
						width: e.thumbnail?.width ?? null,
						height: e.thumbnail?.height ?? null
					}
				: null,
			author: e.author
				? {
						name: e.author.name ?? null,
						url: e.author.url ?? null,
						iconUrl: e.author.proxyIconURL ?? e.author.proxy_icon_url ?? e.author.iconURL ?? null
					}
				: null,
			fields: Array.isArray(e.fields) ? e.fields.map((f: any) => ({ name: f.name, value: f.value, inline: !!f.inline })) : undefined
		})),
		attachments: rawAttachments.map((a: any): any => ({
			id: a.id ?? null,
			filename: a.name ?? a.filename ?? null,
			url: a.url ?? null,
			proxyURL: a.proxyURL ?? a.proxy_url ?? null,
			contentType: a.contentType ?? a.content_type ?? null,
			size: a.size ?? undefined,
			width: a.width ?? null,
			height: a.height ?? null
		})),
		stickers: rawStickers.map((s: any): any => ({
			id: s.id ?? null,
			name: s.name ?? null,
			format: s.format ?? s.formatType ?? null,
			url: s.url ?? s.image?.proxyURL ?? null
		}))
	};
}

export async function extractForwarded(message: any): Promise<ForwardedData | null> {
	try {
		let source: any = (message as any).forwarded ?? (message as any).forwardedMessage ?? null;

		if (!source) {
			const snapshots = (message as any).messageSnapshots;
			if (snapshots && typeof snapshots.values === "function") {
				const iterator = snapshots.values();
				const first = iterator.next();
				if (!first.done) source = first.value;
			}
		}

		if (source) {
			return {
				fromMessageId: source.id ?? null,
				fromChannelId: source.channelId ?? source.channel?.id ?? null,
				fromGuildId: source.guildId ?? source.guild?.id ?? null,
				original: buildForwardedOriginal(source)
			};
		}

		return null;
	} catch {
		return null;
	}
}
