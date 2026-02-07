import type { Attachment } from "./attachment";
import type { Author } from "./author";
import type { Interaction } from "./interaction";
import type { Poll } from "./poll";
import type { Reaction } from "./reaction";

export interface MessageProps {
	id: string;
	author: Author;
	compact?: boolean;
	timestamp?: string;
	editedAt?: string | null;
	content?: unknown;
	attachments?: Attachment[];
	embeds?: unknown[];
	buttons?: unknown[];
	actionRows?: unknown[];
	selects?: unknown[];
	stickers?: Sticker[];
	replyTo?: ReplyReference | null;
	forwardedFrom?: ForwardedReference | null;
	forwardedMessage?: Partial<MessageProps> | null;
	reactions?: Reaction[];
	resolvedUsers?: ResolvedUsers;
	resolvedRoles?: ResolvedRoles;
	resolvedChannels?: Record<string, { name?: string | null; guildId?: string | null }>;
	channelGuildId?: string | null;
	emojiUrls?: Record<string, string>;
	poll?: Poll;
	interaction?: Interaction;
	messageType?: number;
	pinned?: boolean;
	onPinIconClick?: () => void;
	onNavigateToMessage?: (id: string) => void;
	referencedMessage?: Partial<MessageProps> | null;
	referencedMessageId?: string | number | null;
}

export interface ReplyReference {
	id: string;
	authorName?: string;
	author?: Partial<Author>;
	preview?: string;
	content?: string;
	timestamp?: string;
	embeds?: unknown[];
	attachments?: unknown[];
	stickers?: unknown[];
	edited?: boolean;
	editedAt?: string;
}

export interface ForwardedReference {
	id?: string;
	name?: string;
}

export interface Sticker {
	url: string;
	name?: string;
}

export interface ResolvedUsers {
	[id: string]: {
		displayName?: string;
		username?: string;
		avatar?: string;
	};
}

export interface ResolvedRoles {
	[id: string]: {
		name?: string;
		color?: string;
	};
}
