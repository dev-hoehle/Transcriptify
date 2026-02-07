
import type { MessageProps } from "../types/message";
import PinIcon from "./icons/PinIcon";

export default function ChannelPinnedMessage({
	message,
	referencedMessage,
	onOpenPinnedMessages,
	onNavigateToMessage
}: {
	message: MessageProps;
	referencedMessage?: Partial<MessageProps> | null;
	onOpenPinnedMessages: () => void;
	onNavigateToMessage?: (id: string) => void;
}) {
	return (
		<div className="flex items-center gap-2 py-1  w-full text-base">
			<div className="w-10 shrink-0 flex items-start justify-start mt-0.5 relative">
				<div className="w-10 h-10 flex items-center justify-center">
					<PinIcon className="text-[#949BA4]" width={16} height={16} />
				</div>
			</div>

			<div className="flex-1 text-base">
				<span
					onClick={() => referencedMessage && referencedMessage.id && onNavigateToMessage && onNavigateToMessage(String(referencedMessage.id))}
					className="font-semibold text-base hover:underline cursor-pointer"
					style={{ color: message.author.color ?? "#FFFFFF" }}
				>
					{message.author.username}
				</span>
				<span className="text-[#B5BAC1]"> pinned </span>
				<span
					onClick={() => referencedMessage && referencedMessage.id && onNavigateToMessage && onNavigateToMessage(String(referencedMessage.id))}
					className="text-white hover:underline cursor-pointer"
				>
					a message
				</span>
				<span className="text-[#B5BAC1]"> to this channel. </span>
				<span className="text-white hover:underline cursor-pointer" onClick={onOpenPinnedMessages}>
					See all pinned messages.
				</span>
			</div>
		</div>
	);
}
