export type SerializableAuthor = {
	id: string;
	username: string;
	tag?: string;
	guildTag?: {
		name?: string | null;
		iconUrl?: string | null;
	} | null;
	nickname?: string | null;
	avatar?: string | null;
	bot?: boolean;
	color?: string | null;
	verified?: boolean | null;
};

export type SerializableAttachment = {
	id: string;
	filename: string;
	url: string;
	proxyURL?: string | null;
	contentType?: string | null;
	size?: number;
	width?: number | null;
	height?: number | null;
};

export type SerializableEmbedField = {
	name: string;
	value: string;
	inline?: boolean;
};

export type SerializableEmbed = {
	title?: string | null;
	description?: string | null;
	url?: string | null;
	timestamp?: string | null;
	color?: string | null;
	footer?: { text?: string | null; iconUrl?: string | null } | null;
	image?: { url?: string | null } | null;
	thumbnail?: { url?: string | null } | null;
	author?: { name?: string | null; url?: string | null; iconUrl?: string | null } | null;
	fields?: SerializableEmbedField[];
};

export type SerializableButton = {
	type?: number;
	customId?: string | null;
	label?: string | null;
	style?: number | null;
	emoji?: { id?: string | null; name?: string | null } | null;
	url?: string | null;
	disabled?: boolean | null;
};

export type SerializableSelect = {
	customId?: string | null;
	placeholder?: string | null;
	minValues?: number | null;
	maxValues?: number | null;
	options?: { label: string; value: string; description?: string | null; default?: boolean }[];
};

export type SerializableComponent = {
	type: number;
	components?: (SerializableButton | SerializableSelect | any)[];
};

export type SerializableSticker = {
	id: string;
	name?: string | null;
	tags?: string | null;
	format?: string | null;
};

export type SerializableReaction = {
	emoji: { id?: string | null; name?: string | null; animated?: boolean | null };
	count: number;
	me?: boolean | null;
};

export type SerializablePollOption = {
	id?: string | null;
	label?: string | null;
	count?: number | null;
	voters?: string[] | null;
};

export type SerializablePoll = {
	type: "reactions" | "buttons" | "selects" | "embed" | "native";
	question?: string | null;
	options: SerializablePollOption[];
	totalVotes?: number | null;
	endsAt?: string | null;
};

export type SerializableInteraction = {
	id?: string | null;
	type?: number | null;
	name?: string | null;
	user?: { id: string; username: string } | null;
};

export type SerializableMessage = {
	id: string;
	content: string;
	author: string | null;
	createdAt: string;
	messageType?: string | number;
	embeds?: SerializableEmbed[];
	actionRows?: SerializableComponent[];
	buttons?: SerializableButton[];
	selects?: SerializableSelect[];
	stickers?: SerializableSticker[];
	reactions?: SerializableReaction[];
	editedAt?: string | null;
	attachments: SerializableAttachment[];
	pinned: boolean;
	interaction?: SerializableInteraction | null;
	referencedMessageId?: string | null;
	poll?: SerializablePoll | null;
	forwarded?: {
		fromMessageId?: string | null;
		fromChannelId?: string | null;
		fromGuildId?: string | null;
		original?: {
			id?: string;
			content?: string;
			author?: string | null;
			createdAt?: string | null;
			embeds?: SerializableEmbed[];
			attachments?: SerializableAttachment[];
			stickers?: SerializableSticker[];
		} | null;
	} | null;
};

export type ExportableTranscript = {
	meta: {
		channelId: string;
		channelName?: string | null;
		guildId?: string | null;
		generatedAt: string;
		messageCount: number;
	};
	messages: SerializableMessage[];
	resolvedUsers?: Record<string, Omit<SerializableAuthor, "id">>;
	resolvedRoles?: Record<string, { name: string; color: string | null }>;
	resolvedChannels?: Record<string, { name?: string | null; guildId?: string | null }>;
};
