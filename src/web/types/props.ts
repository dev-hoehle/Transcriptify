import type React from "react";
import type { TranscriptThemes } from "./theme";
import type { MessageProps, ResolvedUsers, ResolvedRoles } from "./message";
import type { Author, GuildTag } from "./author";
import type { Reaction } from "./reaction";
import type { Poll } from "./poll";
import type { Attachment } from "./attachment";
import type { Interaction } from "./interaction";
import type { ChannelInfo } from "./channel";

export interface TranscriptProps {
	channel?: ChannelInfo;
	messages?: unknown[];
	className?: string;
	theme?: TranscriptThemes;
	allowThemeSwitching?: boolean;
	allowThemeSwitchingPersist?: boolean;
	poweredBy?: boolean | string;
	resolvedUsers?: Record<string, unknown>;
	resolvedRoles?: Record<string, unknown>;
	resolvedChannels?: Record<string, { name?: string | null; guildId?: string | null }>;
	exportedAt?: string;
}

export interface ThemeSwitcherProps {
	currentTheme: TranscriptThemes;
	onThemeChange: (theme: TranscriptThemes) => void;
}

export interface ReplyProps {
	replyTo: any;
	onReplyClick: (ev: React.MouseEvent) => void;
	defaultAvatar: string;
	resolvedUsers?: Record<string, unknown>;
	resolvedRoles?: Record<string, unknown>;
	resolvedChannels?: Record<string, { name?: string | null; guildId?: string | null }>;
}

export interface ForwardedMessageProps {
	message: Partial<MessageProps>;
	brokenImages: Set<string>;
	onImageError: (url: string) => void;
	renderContent: (content: unknown) => React.ReactNode;
	defaultAvatar: string;
}

export interface PollEndMessageProps {
	id: string;
	author: Author;
	embeds: unknown[];
	replyTo?: unknown;
	timeAgoDisplay: string;
}

export interface MessageStickersProps {
	stickers: { url: string; name?: string }[];
}

export interface MessageSelectsProps {
	selects: unknown[];
}

export interface MessageReactionsProps {
	reactions: Reaction[];
}

export interface MessagePollProps {
	poll: Poll;
}

export interface MessageHeaderProps {
	author: Author;
	timestamp?: string;
	editedAt?: string | null;
	relativeTimestamp: string;
	tagDate: string;
	pinned?: boolean;
}

export interface MessageEmbedsProps {
	embeds: unknown[];
	resolvedUsers?: ResolvedUsers;
	resolvedRoles?: ResolvedRoles;
	resolvedChannels?: Record<string, { name?: string | null; guildId?: string | null }>;
	channelGuildId?: string | null;
	interaction?: Interaction;
}

export interface MessageContentProps {
	content: React.ReactNode;
}

export interface MessageButtonsProps {
	buttons: unknown[];
}

export interface MessageAvatarProps {
	avatar: string;
	bot?: boolean;
	hasReply?: boolean;
	hasInteraction?: boolean;
}

export interface MessageAttachmentsProps {
	attachments: Attachment[];
	brokenImages: Set<string>;
	onImageError: (url: string) => void;
}

export interface CompactMessageContentProps {
	timestamp?: string;
	hover: boolean;
	content: React.ReactNode;
}

export interface CommandLineProps {
	interaction: Interaction;
	resolvedUsers?: ResolvedUsers;
	defaultAvatar: string;
}

export interface PollEndContent {
	question?: string;
	options?: Array<{ label?: string; count?: number }>;
}

export interface UseMessageContentParams {
	content: any;
	attachments?: Attachment[];
	embeds?: unknown[];
	emojiUrls?: Record<string, string>;
	resolvedUsers?: ResolvedUsers;
	resolvedRoles?: ResolvedRoles;
	resolvedChannels?: Record<string, { name?: string | null; guildId?: string | null }>;
	channelGuildId?: string | null;
}

export interface TranscriptSSRProps {
	channel: ChannelInfo;
	messages: any[];
	theme: TranscriptThemes;
	allowThemeSwitching: boolean;
	allowThemeSwitchingPersist: boolean;
	poweredBy: boolean | string;
	className?: string;
	resolvedUsers?: Record<string, unknown>;
	resolvedRoles?: Record<string, unknown>;
	resolvedChannels?: Record<string, { name?: string | null; guildId?: string | null }>;
	exportedAt?: string;
}

export interface TranscriptCdnConfig {
	cdnBase?: string;
	mediaBase?: string;
}
