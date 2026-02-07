export interface GuildTag {
	name?: string | null;
	iconUrl?: string | null;
}

export interface AuthorData {
	id: string;
	username: string;
	tag?: string;
	guildTag?: GuildTag | null;
	nickname?: string | null;
	avatar?: string | null;
	bot: boolean;
	color?: string | null;
	verified?: boolean | null;
}

export interface ForwardedOriginal {
	id: string | null;
	content: string;
	author: string | null;
	createdAt: string | null;
	embeds: any[];
	attachments: any[];
	stickers: any[];
}

export interface ForwardedData {
	fromMessageId: string | null;
	fromChannelId: string | null;
	fromGuildId: string | null;
	original: ForwardedOriginal;
}
