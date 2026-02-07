import AudioPlayer from "./AudioPlayer";
import Embed from "./Embed";
import FileAudioIcon from "./icons/FileAudioIcon";
import FileCodeIcon from "./icons/FileCodeIcon";
import FileDocumentIcon from "./icons/FileDocumentIcon";
import type { ForwardedMessageProps } from "../types/props";
import { isImageUrl, getAttachmentKind, formatFileSize, extractFilenameFromUrl, isAudioUrl } from "./messageHelpers";

export default function ForwardedMessage({ message, brokenImages, onImageError, renderContent, defaultAvatar }: ForwardedMessageProps) {
	const getAttachmentIcon = (kind: string) => {
		switch (kind) {
			case "audio":
				return FileAudioIcon;
			case "code":
				return FileCodeIcon;
			default:
				return FileDocumentIcon;
		}
	};

	return (
		<div className="relative mt-2 pl-3 border-l-4" style={{ borderColor: "#242427" }}>
			<div className="flex items-center gap-2 text-xs text-[#949BA4] mb-2">
				<svg
					aria-hidden="true"
					role="img"
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					fill="none"
					viewBox="0 0 24 24"
					className="w-4 h-4"
				>
					<path
						fill="var(--text-muted, #949BA4)"
						d="M21.7 7.3a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L18.58 9H13a7 7 0 0 0-7 7v4a1 1 0 1 1-2 0v-4a9 9 0 0 1 9-9h5.59l-3.3-3.3a1 1 0 0 1 1.42-1.4l5 5Z"
					/>
				</svg>
				<span>Forwarded</span>
			</div>

			<div className="flex-1 min-w-0 ml-0">
				<div className="mt-1 text-sm text-[#DBDEE1] break-words">{message.content ? renderContent(message.content) : null}</div>

				{message.embeds && message.embeds.length > 0 && (
					<div className="mt-2 space-y-2">
						{message.embeds.map((e: any, i: number) => (
							<Embed key={`fwd-embed-${i}`} {...e} />
						))}
					</div>
				)}

				{message.attachments && message.attachments.length > 0 && (
					<div className="mt-2 flex flex-col gap-2">
						{message.attachments.map((a: any, i: number) => {
							const url = typeof a === "string" ? a : a?.url || "";
							let filename = typeof a === "string" ? undefined : a?.filename;
							if (!filename) filename = extractFilenameFromUrl(url) || "file";
							const filesize = typeof a === "string" ? "" : formatFileSize(a?.size, a?.size_human);
							const imageLike = isImageUrl(url);
							const audioLike = isAudioUrl(url);
							const isBroken = brokenImages.has(url);

							if (imageLike && !isBroken) {
								return (
									<div key={`fwd-att-${i}`} className="mb-2 max-w-[520px]">
										<img
											src={url}
											alt={filename}
											className={`rounded w-full h-auto ${isBroken ? "image-error" : ""}`}
											onError={() => onImageError(url)}
										/>
									</div>
								);
							}

							if (audioLike) {
								return (
									<div key={`fwd-att-audio-${i}`}>
										<AudioPlayer url={url} filename={filename} filesize={filesize} />
									</div>
								);
							}

							const kind = getAttachmentKind(filename, url);
							const Icon = getAttachmentIcon(kind);

							return (
								<div key={`fwd-att-${i}`} className="group relative inline-block max-w-[520px]">
									<a
										href={url}
										className="flex items-center gap-3 px-4 py-3 bg-[#1e1f22] hover:bg-[#23252b] border border-[#111214] rounded-lg transition-colors"
										target="_blank"
										rel="noreferrer"
									>
										<Icon className="h-10 w-8 flex-shrink-0" />
										<div className="flex-1 min-w-0">
											<div className="text-[15px] font-medium text-[#00a8fc] truncate hover:underline">{filename}</div>
											<div className="text-xs text-[#b5bac1] mt-1">{filesize}</div>
										</div>
										<div className="opacity-0 group-hover:opacity-100 transition-opacity">
											<svg width="20" height="20" viewBox="0 0 24 24">
												<path
													fill="#b5bac1"
													d="M12 2a1 1 0 0 1 1 1v10.59l3.3-3.3a1 1 0 1 1 1.4 1.42l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 1 1 1.4-1.42l3.3 3.3V3a1 1 0 0 1 1-1ZM3 20a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2H3Z"
												/>
											</svg>
										</div>
									</a>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
