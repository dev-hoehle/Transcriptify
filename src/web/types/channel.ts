export interface ChannelInfo {
	name: string;
	id?: string;
	topic?: string;
	guildName?: string;
	type?: "text" | "voice" | "announcement";
	guildId?: string | null;
}
