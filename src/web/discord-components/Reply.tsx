import type React from "react";
import { formatDate } from "./utils/date";
import type { ReplyProps } from "../types/props";
import { parseMarkdown } from "./utils/markdown";

export default function Reply({ replyTo, onReplyClick, defaultAvatar, resolvedUsers, resolvedRoles, resolvedChannels }: ReplyProps) {
	let previewSource: string | null = null;
	let isAttachment = false;
	if (replyTo?.embeds && Array.isArray(replyTo.embeds) && replyTo.embeds.length > 0) {
		isAttachment = true;
	} else if (replyTo?.attachments && Array.isArray(replyTo.attachments) && replyTo.attachments.length > 0) {
		isAttachment = true;
	} else if (replyTo?.stickers && Array.isArray(replyTo.stickers) && replyTo.stickers.length > 0) {
		isAttachment = true;
	} else if (typeof replyTo?.preview === "string") {
		previewSource = replyTo.preview;
	} else if (typeof replyTo?.content === "string") {
		previewSource = replyTo.content;
	}

	const preview = isAttachment
		? "Click to see attachment"
		: previewSource
			? (() => {
					const raw = previewSource.length > 140 ? `${previewSource.slice(0, 137)}...` : previewSource;
					return parseMarkdown(raw, resolvedUsers as any, resolvedRoles as any, resolvedChannels as any);
				})()
			: "Click to see attachment";

	const timestamp = replyTo?.timestamp ? new Date(replyTo.timestamp) : null;
	const shortTime = timestamp ? formatDate(timestamp) : "";

	const handleKeyDown = (ev: React.KeyboardEvent) => {
		if (ev.key === "Enter" || ev.key === " ") {
			ev.preventDefault();
			onReplyClick(ev as any);
		}
	};

	return (
		<div
			className="flex items-center gap-2 pl-3 text-[13px] cursor-pointer group leading-tight text-[#b5bac1] mb-1"
			onClick={onReplyClick}
			onKeyDown={handleKeyDown}
			role="button"
			tabIndex={0}
		>
			<div className="flex items-center gap-1 min-w-0">
				<img src={replyTo?.author?.avatar || defaultAvatar} alt="" className="w-4 h-4 rounded-full object-cover flex-shrink-0" />

				<span className="font-semibold group-hover:underline flex-shrink-0 text-[#b5bac1] leading-snug" style={{ color: "#b5bac1" }}>
					{replyTo?.author?.username || replyTo?.author?.name || replyTo?.authorName || "Unknown User"}
				</span>

				{replyTo?.author?.guildTag?.name && (
					<div className="flex items-center gap-0.5 bg-[#2b2d31] rounded px-1 py-0.5 text-[10px] font-medium flex-shrink-0">
						{replyTo?.author?.guildTag?.iconUrl && <img src={replyTo.author.guildTag.iconUrl} alt="" className="w-3 h-3 rounded-sm" />}
						<span className="text-[#b5bac1]">{replyTo.author.guildTag.name}</span>
					</div>
				)}

				{replyTo?.author?.bot && (
					<span className="text-[9px] text-white bg-[#5865F2] rounded px-1 py-0.5 leading-none font-medium flex-shrink-0 flex items-center gap-0.5">
						{replyTo?.author?.verified && (
							<svg viewBox="0 0 24 24" className="w-2.5 h-2.5" xmlns="http://www.w3.org/2000/svg" aria-hidden>
								<path
									fill="#fff"
									fillRule="evenodd"
									d="M19.06 6.94a1.5 1.5 0 0 1 0 2.12l-8 8a1.5 1.5 0 0 1-2.12 0l-4-4a1.5 1.5 0 0 1 2.12-2.12L10 13.88l6.94-6.94a1.5 1.5 0 0 1 2.12 0Z"
									clipRule="evenodd"
								></path>
							</svg>
						)}
						<span>APP</span>
					</span>
				)}

				{timestamp && <span className="text-[11px] text-[#949ba4] flex-shrink-0">{shortTime}</span>}

				{(replyTo?.editedAt || replyTo?.edited) && <span className="text-[10px] text-[#949ba4] flex-shrink-0">(edited)</span>}

				<span className="text-[#b5b6b8] truncate whitespace-nowrap italic">
					{preview}
					{isAttachment ? " 🖼️" : ""}
				</span>
			</div>
		</div>
	);
}
