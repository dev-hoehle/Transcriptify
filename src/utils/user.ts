import type { User, GuildMember } from "discord.js";
import { guildTagCache, userColorCache } from "./cache";
import type { GuildTag } from "../types/entities";

export async function getGuildTagForUser(user: User): Promise<GuildTag> {
	const cached: GuildTag | undefined = guildTagCache.get(user.id);
	if (cached) {
		return cached;
	}

	const primaryGuild: any = (user as any).primaryGuild;
	if (!user.bot && primaryGuild && primaryGuild.identityEnabled) {
		const tag: GuildTag = {
			name: primaryGuild.tag ?? undefined,
			iconUrl:
				primaryGuild.identityGuildId && primaryGuild.badge
					? `https://cdn.discordapp.com/clan-badges/${primaryGuild.identityGuildId}/${primaryGuild.badge}.png`
					: null
		};
		guildTagCache.set(user.id, tag);
		return tag;
	}

	const emptyTag: GuildTag = { name: null, iconUrl: null };
	guildTagCache.set(user.id, emptyTag);
	return emptyTag;
}

export async function getColorForUser(user: User, guild: any | null, member?: GuildMember | null): Promise<string | null> {
	const guildId: string | null = guild?.id ?? null;
	if (!guildId) return null;

	const key: string = `${guildId}:${user.id}`;
	if (userColorCache.has(key)) {
		return userColorCache.get(key) ?? null;
	}

	let memberToUse: GuildMember | null = member ?? null;
	if (!memberToUse) {
		try {
			memberToUse = await (guild as any).members.fetch(user.id).catch(() => null);
		} catch {
			memberToUse = null;
		}
	}

	let result: string | null = null;
	if (memberToUse) {
		const highestHex: string | null = (memberToUse.roles?.highest?.hexColor ?? null) as string | null;
		const hex: string | null =
			highestHex && highestHex !== "#000000"
				? highestHex
				: memberToUse.displayHexColor && memberToUse.displayHexColor !== "#000000"
					? memberToUse.displayHexColor
					: null;
		if (hex) result = hex;
	}

	userColorCache.set(key, result);
	return result;
}
