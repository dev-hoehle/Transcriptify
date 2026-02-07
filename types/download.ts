import type { APIAttachment, APIMessage, Awaitable } from "discord.js";
import type { WebpOptions } from "sharp";

export type ResolveImageCallback = (attachment: APIAttachment, message: APIMessage) => Awaitable<string | null | undefined>;

export type ImageCompression = {
	quality: number;
	convertToWebP?: boolean;
	options?: Omit<WebpOptions, "quality" | "force">;
};

export type DownloaderOptions = {
	maxFileSizeKB?: number;
	compression?: ImageCompression;
};
