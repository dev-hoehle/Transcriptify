import type { Message, GuildMember } from "discord.js";
import { getGuildTagForUser, getColorForUser } from "./user";
import { extractEmbeds, extractAttachments, extractStickers, extractReactions, extractComponents, extractInteraction } from "./extractors";
import { extractPoll } from "./polls";
import { buildSystemAuthor, extractForwarded } from "./authors";
import type { SerializableMessage, SerializableAuthor } from "../../types/exportableTranscript";

export async function messageToSerializable(message: Message): Promise<{ message: SerializableMessage; author: SerializableAuthor | null } | null> {
	if ((message as any).type === 24) return null;
	const attachments: any[] = extractAttachments(message);
	const embeds: any[] = extractEmbeds(message);
	const stickers: any[] = extractStickers(message);
	const reactions: any[] = extractReactions(message);
	const componentData: any = extractComponents(message);
	const interaction: any = extractInteraction(message);
	const poll: any = extractPoll(message);
	const referencedMessageId: string | null = (message as any).reference?.messageId ?? null;

	const hasAuthor: boolean = !!message.author;
	const authorObj: SerializableAuthor = hasAuthor
		? {
				id: message.author!.id,
				username: message.author!.username,
				tag: (message.author as any).tag ?? undefined,
				guildTag: await getGuildTagForUser(message.author!),
				nickname: (message.member as GuildMember | null)?.nickname ?? null,
				avatar: message.author!.avatar ?? null,
				bot: message.author!.bot ?? false,
				color: await getColorForUser(message.author!, (message as any).guild ?? null, (message.member as GuildMember | null) ?? null),
				verified: extractBotVerified(message.author!)
			}
		: buildSystemAuthor(message.id, (message as any).type);

	const forwarded: any = await extractForwarded(message);

	const authorId: string | null = authorObj ? authorObj.id : null;

	return {
		message: {
			id: message.id,
			content: message.content ?? (typeof (message as any).type !== "undefined" ? `[System message: type ${(message as any).type}]` : ""),
			author: authorId,
			createdAt: message.createdAt.toISOString(),
			messageType: (message as any).type ?? undefined,
			embeds: embeds.length > 0 ? embeds : undefined,
			actionRows: componentData?.actionRows ?? undefined,
			buttons: componentData?.buttons ?? undefined,
			selects: componentData?.selects ?? undefined,
			stickers: stickers.length > 0 ? stickers : undefined,
			reactions: reactions.length > 0 ? reactions : undefined,
			editedAt: message.editedAt ? message.editedAt.toISOString() : null,
			attachments,
			pinned: message.pinned ?? false,
			interaction,
			referencedMessageId: forwarded ? null : referencedMessageId,
			poll,
			forwarded
		},
		author: authorObj
	};
}

function extractBotVerified(user: any): boolean | null {
	if (!user.bot) return null;

	try {
		const flags: any = (user as any).flags ?? null;
		if (!flags) return null;

		if (typeof flags.has === "function") {
			return !!(flags.has("VerifiedBot") || flags.has("VERIFIED_BOT") || flags.has("VERIFIED_DEVELOPER"));
		}

		if (typeof flags.bitfield === "number") {
			return ((flags.bitfield as number) & 0x80) === 0x80;
		}

		if (typeof flags === "number") {
			return ((flags as number) & 0x80) === 0x80;
		}
	} catch {}

	return null;
}
