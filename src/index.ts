import { version, Collection, type Channel, type Message, type TextBasedChannel } from "discord.js";
import type { TranscriptCreateOptions } from "./types/general";
import { messageToSerializable } from "./utils/transformer";
import { enrichPollVoters } from "./utils/polls";
import { generateHtml } from "./generateHtml";
import type { ExportableTranscript, SerializableMessage } from "./types/exportableTranscript";

export type { TranscriptCreateOptions } from "./types/general";
export { defaultTranscriptCreateOptions } from "./types/general";


const djsVersion: string = ((version || "").split(".")[0] || "");
if (djsVersion !== "14" && djsVersion !== "15") {
	console.error(`Unsupported discord.js version: ${version}. This library only supports v14 and v15 of discord.js.`);
	process.exit(1);
}

export async function createTranscript(channel: TextBasedChannel, options: TranscriptCreateOptions = {}): Promise<string> {
	if (!channel.isTextBased()) throw new TypeError("Provided channel must be text-based");

	let channelMessages: Message[] = [];
	let lastMessageID: string | undefined;
	const { limit } = options;
	const resolveLimit: number = typeof limit === "undefined" ? Infinity : limit;

	while (true) {
		const fetchLimitOptions: { limit: number; before?: string } = { limit: 100, before: lastMessageID };
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

export async function createTranscriptRaw(channel: TextBasedChannel, options: TranscriptCreateOptions = {}): Promise<Message[]> {
	if (!channel.isTextBased()) throw new TypeError("Provided channel must be text-based");

	let channelMessages: Message[] = [];
	let lastMessageID: string | undefined;
	const { limit } = options;
	const resolveLimit: number = typeof limit === "undefined" ? Infinity : limit;

	while (true) {
		const fetchLimitOptions: { limit: number; before?: string } = { limit: 100, before: lastMessageID };
		if (!lastMessageID) delete fetchLimitOptions.before;

		const messages = await channel.messages.fetch(fetchLimitOptions);
		channelMessages.push(...messages.values());
		lastMessageID = messages.lastKey();

		if (messages.size < 100) break;
		if (channelMessages.length >= resolveLimit) break;
	}
	if (resolveLimit < channelMessages.length) channelMessages = channelMessages.slice(0, limit);
	return channelMessages.reverse();
}


export async function generateFromMessages(
	messages: Message[] | Collection<string, Message>,
	channel: Channel,
	options: TranscriptCreateOptions = {}
): Promise<string> {
	const messageArray: Message[] = messages instanceof Collection ? Array.from(messages.values()) : messages;
	const batchSize: number = 25;

	const messagesSerialized: SerializableMessage[] = [];
	const resolvedAuthorsMap: Map<string, any> = new Map();
	const resolvedRolesMap: Map<string, { name: string; color: string | null }> = new Map();
	const resolvedChannelsMap: Map<string, { name?: string | null; guildId?: string | null }> = new Map();
	const transcriptGuildId: string | null = (channel as any).guild?.id ?? null;
	const roleMentionRegex: RegExp = /<@&(\d+)>/g;

	for (let i: number = 0; i < messageArray.length; i += batchSize) {
		const batch: Message[] = messageArray.slice(i, i + batchSize);
		const serialized = await Promise.all(batch.map((m: Message) => messageToSerializable(m)));

		for (let j: number = 0; j < serialized.length; j++) {
			const result = serialized[j];
			if (!result) continue;

			if (result.author) {
				resolvedAuthorsMap.set(result.author.id, result.author);
			}

			if (result.message.poll) {
				await enrichPollVoters(batch[j], result.message.poll);
			}

			messagesSerialized.push(result.message);
		}

		for (const message of batch) {
			let allContent: string = message.content ?? "";

			if ((message as any).embeds) {
				const embedArray: any[] = Array.isArray((message as any).embeds)
					? (message as any).embeds
					: typeof (message as any).embeds.values === "function"
						? Array.from((message as any).embeds.values())
						: [];

				for (const embed of embedArray) {
					if (embed.title) allContent += " " + embed.title;
					if (embed.description) allContent += " " + embed.description;
					if (embed.fields) {
						for (const field of embed.fields) {
							if (field.name) allContent += " " + field.name;
							if (field.value) allContent += " " + field.value;
						}
					}
					if (embed.footer?.text) allContent += " " + embed.footer.text;
				}
			}

			let match: RegExpExecArray | null;

			roleMentionRegex.lastIndex = 0;
			while ((match = roleMentionRegex.exec(allContent)) !== null) {
				const roleId: string = match[1] as string;
				if (resolvedRolesMap.has(roleId)) continue;

				try {
					if ((message as any).guild) {
						const role = await (message.guild as any).roles.fetch(roleId).catch(() => null);
						if (role) {
							resolvedRolesMap.set(roleId, {
								name: role.name,
								color: role.hexColor
							});
						}
					}
				} catch {}
			}

			if ((message as any).mentions?.roles) {
				for (const role of (message as any).mentions.roles.values?.() ?? []) {
					if (!resolvedRolesMap.has(role.id)) {
						resolvedRolesMap.set(role.id, {
							name: role.name,
							color: role.hexColor
						});
					}
				}
			}

			if ((message as any).mentions?.channels) {
				for (const mentionedChannel of (message as any).mentions.channels.values?.() ?? []) {
					if (mentionedChannel && mentionedChannel.id && !resolvedChannelsMap.has(mentionedChannel.id)) {
						const mentionGuildId = mentionedChannel.guildId ?? (mentionedChannel as any).guild?.id ?? message.guild?.id ?? null;
						if (transcriptGuildId && mentionGuildId && mentionGuildId !== transcriptGuildId) {
							continue;
						}
						resolvedChannelsMap.set(mentionedChannel.id, {
							name: mentionedChannel.name ?? null,
							guildId: mentionGuildId
						});
					}
				}
			}
		}
	}

	const resolvedUsersObj: Record<string, any> = {};
	for (const [userId, authorData] of resolvedAuthorsMap.entries()) {
		const { id: _discard, ...authorWithoutId } = authorData ?? {};
		resolvedUsersObj[userId] = authorWithoutId;
	}

	const resolvedRolesObj: Record<string, { name: string; color: string | null }> = {};
	for (const [roleId, roleData] of resolvedRolesMap.entries()) {
		resolvedRolesObj[roleId] = roleData;
	}

	const resolvedChannelsObj: Record<string, { name?: string | null; guildId?: string | null }> = {};
	for (const [channelId, channelData] of resolvedChannelsMap.entries()) {
		resolvedChannelsObj[channelId] = channelData;
	}

	if (options?.ignore?.attachments) {
		const ignoreImgs = !!options.ignore.attachments.images;
		const ignoreVids = !!options.ignore.attachments.videos;
		const ignoreAudio = !!options.ignore.attachments.audio;
		const ignoreFiles = !!options.ignore.attachments.files;
		for (const m of messagesSerialized) {
			if (!m.attachments || !Array.isArray(m.attachments)) continue;
			const filtered = (m.attachments as any[]).filter((a: any) => {
				const url = typeof a === "string" ? a : (a && (a.url || "")) || "";
				const isImage = /\.(png|jpe?g|gif|webp|svg|bmp|avif)(\?|$)/i.test(url);
				const isVideo = /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(url);
				const isAudio = /\.(mp3|wav|ogg|m4a|flac|aac|weba)(\?|$)/i.test(url);
				if (ignoreImgs && isImage) return false;
				if (ignoreVids && isVideo) return false;
				if (ignoreAudio && isAudio) return false;
				if (ignoreFiles && !isImage && !isVideo && !isAudio) return false;
				return true;
			});
			(m as any).attachments = filtered;
		}
	}

	function messageHasVisibleContent(m: any): boolean {
		if (m.messageType === 6 || m.messageType === 7) return true;
		if (m.content && String(m.content).trim().length > 0) return true;
		if (m.attachments && Array.isArray(m.attachments) && m.attachments.length > 0) return true;
		if (m.stickers && Array.isArray(m.stickers) && m.stickers.length > 0) return true;
		if (m.poll) return true;
		if (m.buttons && Array.isArray(m.buttons) && m.buttons.length > 0) return true;
		if (m.selects && Array.isArray(m.selects) && m.selects.length > 0) return true;
		if (m.forwardedMessage) {
			if (m.forwardedMessage.content && String(m.forwardedMessage.content).trim().length > 0) return true;
			if (m.forwardedMessage.attachments && m.forwardedMessage.attachments.length > 0) return true;
		}
		if (m.embeds && Array.isArray(m.embeds)) {
			for (const e of m.embeds) {
				if (!e) continue;
				if (e.title && String(e.title).trim()) return true;
				if (e.description && String(e.description).trim()) return true;
				if (e.footer && e.footer.text && String(e.footer.text).trim()) return true;
				if (e.author && (e.author.name || e.author.url)) return true;
				if (e.image && e.image.url) return true;
				if (e.thumbnail && e.thumbnail.url) return true;
				if (e.fields && Array.isArray(e.fields) && e.fields.some((f: any) => (f.name && String(f.name).trim()) || (f.value && String(f.value).trim())))
					return true;
			}
		}
		return false;
	}

	const filteredMessages = messagesSerialized.filter((m: any) => messageHasVisibleContent(m));
	messagesSerialized.length = 0;
	messagesSerialized.push(...filteredMessages);

	const transcript: ExportableTranscript = {
		meta: {
			channelId: (channel as any).id ?? "unknown",
			channelName: (channel as any).name ?? null,
			guildId: (channel as any).guild?.id ?? null,
			generatedAt: new Date().toISOString(),
			messageCount: messagesSerialized.length
		},
		messages: messagesSerialized,
		resolvedUsers: resolvedUsersObj,
		resolvedRoles: resolvedRolesObj,
		resolvedChannels: resolvedChannelsObj
	};

	return await generateHtml(transcript, options);
}