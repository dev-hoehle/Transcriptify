interface RawEmbed {
	title?: string;
	description?: string;
	url?: string;
	timestamp?: string;
	color?: string | number;
	hexColor?: string;
	image?: { url?: string; proxyURL?: string; proxy_url?: string; width?: number; height?: number };
	thumbnail?: { url?: string; proxyURL?: string; proxy_url?: string; width?: number; height?: number };
	author?: { name?: string; url?: string; iconURL?: string; proxyIconURL?: string; proxy_icon_url?: string };
	footer?: { text?: string; iconURL?: string };
	fields?: Array<{ name: string; value: string; inline?: boolean }>;
}

interface ExtractedEmbed {
	title: string | null;
	description: string | null;
	url: string | null;
	timestamp: string | null;
	color: string | null;
	footer: { text: string | null; iconUrl: string | null } | null;
	image: { url: string | null; width: number | null; height: number | null } | null;
	thumbnail: { url: string | null; width: number | null; height: number | null } | null;
	author: { name: string | null; url: string | null; iconUrl: string | null } | null;
	fields?: Array<{ name: string; value: string; inline: boolean }>;
}

interface RawAttachment {
	id: string;
	name?: string;
	filename?: string;
	url: string;
	proxyURL?: string;
	contentType?: string;
	size?: number;
	width?: number;
	height?: number;
}

interface ExtractedAttachment {
	id: string;
	filename: string;
	url: string;
	proxyURL: string | null;
	contentType: string | null;
	size: number | undefined;
	width: number | null;
	height: number | null;
	embedUrl?: string;
}

interface RawSticker {
	id: string;
	name?: string;
	tags?: string;
	format?: string;
}

interface ExtractedSticker {
	id: string;
	name: string | null;
	tags: string | null;
	format: string | null;
}

interface RawReaction {
	emoji?: { id?: string; name?: string; animated?: boolean };
	count?: number;
	me?: boolean;
}

interface ExtractedReaction {
	emoji: { id: string | null; name: string | null; animated: boolean };
	count: number;
	me: boolean;
}

interface ExtractedSelectOption {
	label: string;
	value: string;
	description: string | null;
	default: boolean;
}

interface ExtractedButtonComponent {
	type: number;
	customId: string | null;
	label: string | null;
	style: number | null;
	url: string | null;
	disabled: boolean | null;
	emojiUrl?: string;
}

interface ExtractedSelectComponent {
	customId: string | null;
	placeholder: string | null;
	minValues: number | null;
	maxValues: number | null;
	options?: ExtractedSelectOption[];
}

interface ExtractedComponents {
	actionRows: Array<{
		type: number;
		components: Array<Record<string, unknown>>;
	}>;
	buttons: ExtractedButtonComponent[];
	selects: ExtractedSelectComponent[];
}

interface ExtractedInteraction {
	id: string | null;
	type: number | null;
	name: string | null;
	user: { id: string; username: string } | null;
}

interface MessageLike {
	embeds?: unknown;
	attachments?: unknown;
	stickers?: unknown;
	stickerItems?: unknown;
	reactions?: unknown;
	components?: unknown;
	interaction?: Partial<ExtractedInteraction>;
}

function ensureArray<T>(value: unknown): T[] {
	if (!value) return [];
	if (Array.isArray(value)) return value;
	if (typeof (value as any).values === "function") return Array.from((value as any as Map<unknown, T>).values());
	return Array.from(value as Iterable<T>);
}

export function extractEmbeds(message: MessageLike): ExtractedEmbed[] {
	try {
		const embeds = ensureArray<RawEmbed>(message.embeds);
		if (embeds.length === 0) return [];

		return embeds
			.map((e): ExtractedEmbed | null => {
				const hasContent = e.title || e.description || e.author || (e.fields && e.fields.length > 0) || e.footer;
				const imageUrl = e.image?.proxyURL ?? e.image?.proxy_url ?? e.image?.url ?? null;
				const thumbnailUrl = e.thumbnail?.proxyURL ?? e.thumbnail?.proxy_url ?? e.thumbnail?.url ?? null;

				if (!hasContent && (imageUrl || thumbnailUrl) && e.url) {
					return null;
				}

				return {
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
								url: imageUrl,
								width: e.image?.width ?? null,
								height: e.image?.height ?? null
							}
						: null,
					thumbnail: e.thumbnail
						? {
								url: thumbnailUrl,
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
					fields: Array.isArray(e.fields) ? e.fields.map((f) => ({ name: f.name, value: f.value, inline: !!f.inline })) : undefined
				};
			})
			.filter((e): e is ExtractedEmbed => e !== null);
	} catch {
		return [];
	}
}

export function extractAttachments(message: MessageLike): ExtractedAttachment[] {
	try {
		const attachments = ensureArray<RawAttachment>(message.attachments);
		const mappedAttachments: ExtractedAttachment[] = attachments.map((a) => ({
			id: a.id,
			filename: a.name ?? a.filename ?? "",
			url: a.url,
			proxyURL: a.proxyURL ?? null,
			contentType: a.contentType ?? null,
			size: a.size ?? undefined,
			width: a.width ?? null,
			height: a.height ?? null
		}));

		const embeds = ensureArray<RawEmbed>(message.embeds);

		for (const e of embeds) {
			const hasContent = e.title || e.description || e.author || (e.fields && e.fields.length > 0) || e.footer;
			const imageUrl = e.image?.proxyURL ?? e.image?.proxy_url ?? e.image?.url ?? null;
			const thumbnailUrl = e.thumbnail?.proxyURL ?? e.thumbnail?.proxy_url ?? e.thumbnail?.url ?? null;

			if (!hasContent && (imageUrl || thumbnailUrl) && e.url) {
				const url = imageUrl || thumbnailUrl;
				const filename = url.split("/").pop()?.split("?")[0] || "image";

				mappedAttachments.push({
					id: `embed-${Math.random().toString(36).substr(2, 9)}`,
					filename: filename,
					url: url,
					proxyURL: url,
					contentType: null,
					size: undefined,
					width: e.image?.width ?? e.thumbnail?.width ?? null,
					height: e.image?.height ?? e.thumbnail?.height ?? null,
					embedUrl: e.url
				});
			}
		}

		return mappedAttachments;
	} catch {
		return [];
	}
}

export function extractStickers(message: MessageLike): ExtractedSticker[] {
	try {
		const stickers = ensureArray<RawSticker>(message.stickers || message.stickerItems);
		return stickers.length > 0
			? stickers.map(
					(st): ExtractedSticker => ({
						id: st.id,
						name: st.name ?? null,
						tags: st.tags ?? null,
						format: st.format ?? null
					})
				)
			: [];
	} catch {
		return [];
	}
}

export function extractReactions(message: MessageLike): ExtractedReaction[] {
	try {
		const reactionValue = message.reactions;
		const reactions =
			reactionValue && typeof reactionValue === "object" && "cache" in reactionValue
				? ensureArray<RawReaction>((reactionValue as any).cache)
				: ensureArray<RawReaction>(reactionValue);

		return reactions.length > 0
			? reactions.map(
					(r): ExtractedReaction => ({
						emoji: {
							id: r.emoji?.id ?? null,
							name: r.emoji?.name ?? null,
							animated: !!r.emoji?.animated
						},
						count: r.count ?? 0,
						me: !!r.me
					})
				)
			: [];
	} catch {
		return [];
	}
}

export function extractComponents(message: MessageLike): ExtractedComponents | null {
	try {
		const components = message.components as any;
		if (!components || (Array.isArray(components) && components.length === 0)) return null;

		const rows = Array.isArray(components) ? components : components;
		const actionRows = rows.map((r: Record<string, unknown>): { type: number; components: Array<Record<string, unknown>> } => ({
			type: r.type as number,
			components: Array.isArray(r.components) ? (r.components as Array<Record<string, unknown>>) : []
		}));

		const buttons: ExtractedButtonComponent[] = [];
		const selects: ExtractedSelectComponent[] = [];

		for (const r of rows) {
			const rowComponents = Array.isArray((r as Record<string, unknown>).components)
				? ((r as Record<string, unknown>).components as Array<Record<string, unknown>>)
				: [];
			for (const c of rowComponents) {
				if (c.type === 2) {
					const btn: ExtractedButtonComponent = {
						type: 2,
						customId: (c.customId as string) ?? null,
						label: (c.label as string) ?? null,
						style: (c.style as number) ?? null,
						url: (c.url as string) ?? null,
						disabled: typeof c.disabled === "boolean" ? c.disabled : null
					};
					if ((c.emoji as Record<string, unknown>)?.id) {
						const animated = !!(c.emoji as Record<string, unknown>).animated ? "true" : "false";
						btn.emojiUrl = `https://cdn.discordapp.com/emojis/${(c.emoji as Record<string, unknown>).id}.webp?size=96&animated=${animated}`;
					}
					buttons.push(btn);
				}
				if (c.type === 3) {
					selects.push({
						customId: (c.customId as string) ?? null,
						placeholder: (c.placeholder as string) ?? null,
						minValues: (c.minValues as number) ?? null,
						maxValues: (c.maxValues as number) ?? null,
						options: Array.isArray(c.options)
							? (c.options as Array<Record<string, unknown>>).map(
									(o): ExtractedSelectOption => ({
										label: o.label as string,
										value: o.value as string,
										description: (o.description as string) ?? null,
										default: !!o.default
									})
								)
							: undefined
					});
				}
			}
		}

		return { actionRows, buttons, selects };
	} catch {
		return null;
	}
}

export function extractInteraction(message: MessageLike): ExtractedInteraction | null {
	try {
		const interaction = message.interaction;
		if (!interaction) return null;

		return {
			id: interaction.id ?? null,
			type: interaction.type ?? null,
			name: (interaction.name as string) ?? null,
			user: interaction.user ? { id: interaction.user.id as string, username: interaction.user.username as string } : null
		};
	} catch {
		return null;
	}
}
