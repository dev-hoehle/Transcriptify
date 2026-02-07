export interface EmbedField {
	name: string;
	value: string;
	inline?: boolean;
}

export interface EmbedAuthor {
	name: string;
	iconUrl?: string;
	url?: string;
}

export interface EmbedFooter {
	text: string;
	iconUrl?: string;
}

import type { ButtonProps } from "./ui";

export interface EmbedProps {
	title?: string;
	description?: string | null;
	url?: string | null;
	color?: string | null;
	timestamp?: string | null;
	author?: EmbedAuthor | null;
	footer?: EmbedFooter | null;
	image?: string | { url?: string } | null;
	thumbnail?: string | { url?: string } | null;
	fields?: EmbedField[];
	buttons?: ButtonProps[];
	version?: "v1" | "v2";
	resolvedUsers?: Record<string, { displayName?: string }>;
	resolvedRoles?: Record<string, { name?: string; color?: string | number }>;
	resolvedChannels?: Record<string, { name?: string | null; guildId?: string | null }>;
	channelGuildId?: string | null;
	interaction?: { name?: string; user?: { id?: string; username?: string } };
}
