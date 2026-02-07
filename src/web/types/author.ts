export interface Author {
	id?: string;
	name: string;
	username: string;
	avatar: string;
	bot?: boolean;
	verified?: boolean;
	color?: string | null;
	guildTag?: GuildTag | null;
}

export interface GuildTag {
	name?: string | null;
	iconUrl?: string | null;
}
