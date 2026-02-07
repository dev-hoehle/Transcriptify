import React from "react";
import type { MessageProps } from "../types/message";
import PinIcon from "./icons/PinIcon";
import StickerPreview from "./StickerPreview";

export default function PinnedMessagesOverview({
	pinnedMessages,
	onPinnedMessageClick
}: {
	pinnedMessages: MessageProps[];
	onPinnedMessageClick: (messageId: string) => void;
}) {
	if (!pinnedMessages || pinnedMessages.length === 0) {
		return null;
	}

	return (
		<div className="w-full border-b border-[#2C2F33] bg-[#1e2124] py-4 px-4 sm:px-6 sticky top-0 z-20">
			<div className="flex items-center gap-3 mb-4">
				<PinIcon className="text-[#949BA4]" />
				<h2 className="text-base font-semibold text-[#DBDEE1]">Pinned Messages</h2>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
				{pinnedMessages.map((msg) => (
					<div
						key={msg.id}
						className="bg-[#2C2F33] rounded-lg p-3 cursor-pointer hover:bg-[#35393F] transition-colors border border-[#404249]"
						onClick={() => onPinnedMessageClick(msg.id)}
					>
						<div className="flex items-start gap-2 mb-2">
							<img src={msg.author.avatar} alt={msg.author.username} className="w-6 h-6 rounded-full" />
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-1 flex-wrap">
									<span className="text-sm font-semibold text-[#DBDEE1]" style={{ color: msg.author.color ?? "#DBDEE1" }}>
										{msg.author.username}
									</span>
									{msg.author.bot && <span className="text-xs bg-[#5865F2] text-white px-1.5 py-0.5 rounded">APP</span>}
								</div>
							</div>
						</div>

						<div className="text-sm text-[#B5BAC1] truncate">{typeof msg.content === "string" ? msg.content.substring(0, 100) : "No content"}</div>

						{msg.stickers && msg.stickers.length > 0 && (
							<div className="mt-2">
								<div className="text-xs text-[#72767D] mb-1">Sticker</div>
								<StickerPreview st={msg.stickers[0]} size={96} className="w-24 h-24 rounded object-contain" />
							</div>
						)}

						{msg.attachments && msg.attachments.length > 0 && (
							<div className="mt-2">
								{msg.attachments.slice(0, 1).map((attachment, idx) => {
									const url = typeof attachment === "string" ? attachment : attachment?.url;
									const isImage = url && /\.(png|jpe?g|gif|webp|svg|bmp|avif)(\?|$)/i.test(url);

									if (isImage) {
										return <img key={idx} src={url} alt="attachment" className="w-24 h-24 rounded object-cover" />;
									}

									return null;
								})}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
