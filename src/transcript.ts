import { version, Collection, type Channel, type Message, type TextBasedChannel, type GuildMember, type User, type Client } from "discord.js";
import { TranscriptCreateOptions } from "../types/general";
import fs from "fs/promises";
import path from "path";
import type { ExportableTranscript, SerializableMessage } from "../types/exportableTranscript";

type GuildTag = { name?: string | null; iconUrl?: string | null };

const userGuildTagCache = new Map<string, GuildTag>();

export async function resolveGuildTagForUser(user: User): Promise<GuildTag> {
	const cached = userGuildTagCache.get(user.id);
	if (cached) return cached;

	if (!user.bot && (user as any).primaryGuild && (user as any).primaryGuild.identityEnabled) {
		const pg = (user as any).primaryGuild;
		const userGuildTag: GuildTag = { name: user.username, iconUrl: `https://cdn.discordapp.com/clan-badges/${pg.identityEnabled}/${pg.badge}.png` };
		userGuildTagCache.set(user.id, userGuildTag);
		return userGuildTag;
	}

	userGuildTagCache.set(user.id, { name: null, iconUrl: null });
	return {
		name: null,
		iconUrl: null
	};
}

export async function mapMessageToSerializable(m: Message): Promise<SerializableMessage> {
	const mapEmbed = (e: any) => ({
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
		image: e.image ? { url: e.image.url ?? null } : null,
		thumbnail: e.thumbnail ? { url: e.thumbnail.url ?? null } : null,
		author: e.author ? { name: e.author.name ?? null, url: e.author.url ?? null, iconUrl: e.author.iconURL ?? null } : null,
		fields: e.fields ? e.fields.map((f: any) => ({ name: f.name, value: f.value, inline: !!f.inline })) : undefined
	});

	const attachments = Array.from(m.attachments.values()).map((a) => ({
		id: a.id,
		filename: a.name ?? (a as unknown as { filename?: string }).filename ?? "",
		url: a.url,
		proxyURL: (a as unknown as { proxyURL?: string }).proxyURL ?? null,
		contentType: (a as unknown as { contentType?: string }).contentType ?? null,
		size: a.size ?? undefined,
		width: (a as unknown as { width?: number }).width ?? null,
		height: (a as unknown as { height?: number }).height ?? null
	}));

	const referencedMessageId =
		(m.reference && (m.reference as any).messageId) ?? ((m as any).referencedMessage ? (m as any).referencedMessage.id : null) ?? null;

	let forwarded: any = null;
	if (referencedMessageId) {
		let refMsg: Message | null = ((m as any).referencedMessage as Message) ?? null;
		if (!refMsg) {
			try {
				refMsg = await m.fetchReference();
			} catch (e) {
				refMsg = null;
			}
		}

		if (refMsg) {
			const isDifferentOrigin = refMsg.channelId !== (m as any).channelId || (refMsg.guild?.id ?? null) !== (m.guild?.id ?? null);
			if (isDifferentOrigin) {
				const refAttachments = Array.from(refMsg.attachments.values()).map((a) => ({
					id: a.id,
					filename: a.name ?? (a as unknown as { filename?: string }).filename ?? "",
					url: a.url,
					proxyURL: (a as unknown as { proxyURL?: string }).proxyURL ?? null,
					contentType: (a as unknown as { contentType?: string }).contentType ?? null,
					size: a.size ?? undefined,
					width: (a as unknown as { width?: number }).width ?? null,
					height: (a as unknown as { height?: number }).height ?? null
				}));

				const mapEmbed = (e: any) => ({
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
					image: e.image ? { url: e.image.url ?? null } : null,
					thumbnail: e.thumbnail ? { url: e.thumbnail.url ?? null } : null,
					author: e.author ? { name: e.author.name ?? null, url: e.author.url ?? null, iconUrl: e.author.iconURL ?? null } : null,
					fields: e.fields ? e.fields.map((f: any) => ({ name: f.name, value: f.value, inline: !!f.inline })) : undefined
				});

				forwarded = {
					fromMessageId: refMsg.id,
					fromChannelId: refMsg.channelId,
					fromGuildId: refMsg.guild?.id ?? null,
					original: {
						id: refMsg.id,
						content: refMsg.content ?? "",
						author: refMsg.author ? { id: refMsg.author.id, username: refMsg.author.username, tag: (refMsg.author as any).tag ?? null } : null,
						createdAt: refMsg.createdAt ? refMsg.createdAt.toISOString() : null,
						embeds: refMsg.embeds ? refMsg.embeds.map(mapEmbed) : undefined,
						attachments: refAttachments
					}
				};
			}
		}
	}

	const authorId = m.author ? m.author.id : `system:${m.id}`;

	return {
		id: m.id,
		content: m.content ?? (typeof (m as any).type !== "undefined" ? `[System message: type ${(m as any).type}]` : ""),
		author: authorId,
		createdAt: m.createdAt.toISOString(),
		messageType: (m as any).type ?? undefined,
		embeds: (m as any).embeds
			? Array.isArray((m as any).embeds)
				? (m as any).embeds.map(mapEmbed)
				: typeof (m as any).embeds.values === "function"
					? Array.from((m as any).embeds.values()).map(mapEmbed)
					: undefined
			: undefined,
		editedAt: m.editedAt ? m.editedAt.toISOString() : null,
		attachments,
		pinned: m.pinned ?? false,
		referencedMessageId: referencedMessageId,
		forwarded: forwarded
	};
}

export async function createTranscript(channel: TextBasedChannel, options: TranscriptCreateOptions = {}) {
	if (!channel.isTextBased()) throw new TypeError("Provided channel must be text-based");
	let channelMessages: Message[] = [];
	let lastMessageID: string | undefined;
	const { limit } = options;
	const resolveLimit: number = typeof limit === "undefined" ? Infinity : limit;
	while (true) {
		const fetchLimitOptions = { limit: 100, before: lastMessageID } as { limit: number; before?: string };
		if (!lastMessageID) delete fetchLimitOptions.before;
		const messages = await channel.messages.fetch(fetchLimitOptions);
		channelMessages.push(...messages.values());
		lastMessageID = messages.lastKey();
		if (messages.size < 100) break;
		if (channelMessages.length >= resolveLimit) break;
	}
	if (resolveLimit < channelMessages.length) channelMessages = channelMessages.slice(0, limit);
	return generateFromMessages(channelMessages.reverse(), channel, options);
}

export async function generateFromMessages(messages: Message[] | Collection<string, Message>, channel: Channel, options: TranscriptCreateOptions = {}) {
	const transformedMessages = messages instanceof Collection ? Array.from(messages.values()) : messages;
	const messagesSerialized = await Promise.all(transformedMessages.map((m) => mapMessageToSerializable(m)));

	const transcript: ExportableTranscript = {
		meta: {
			channelId: (channel as unknown as { id?: string }).id ?? "unknown",
			channelName: (channel as unknown as { name?: string }).name ?? null,
			guildId: (channel as unknown as { guild?: { id?: string } }).guild?.id ?? null,
			generatedAt: new Date().toISOString(),
			messageCount: messagesSerialized.length
		},
		messages: messagesSerialized
	};

	const fileName = `transcript-${transcript.meta.channelId}-${Date.now()}.json`;
	const outPath = path.join(process.cwd(), fileName);
	await fs.writeFile(outPath, JSON.stringify(transcript, null, 2), "utf8");
	return outPath;
}
