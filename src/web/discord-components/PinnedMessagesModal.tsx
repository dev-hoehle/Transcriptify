import React from "react";
import type { MessageProps } from "../types/message";
import AudioPlayer from "./AudioPlayer";
import Embed from "./Embed";
import ChevronDownIcon from "./icons/ChevronDownIcon";
import CloseIcon from "./icons/CloseIcon";
import PinIcon from "./icons/PinIcon";
import VerifiedIcon from "./icons/VerifiedIcon";
import FileCodeIcon from "./icons/FileCodeIcon";
import FileDocumentIcon from "./icons/FileDocumentIcon";
import StickerPreview from "./StickerPreview";
import { formatDateShort, formatTime } from "./utils/date";
import { buildEmojiCdnUrl } from "../helpers/cdnHelpers";

export default function PinnedMessagesModal({
	pinnedMessages,
	onClose,
	onMessageClick
}: {
	pinnedMessages: MessageProps[];
	onClose: () => void;
	onMessageClick: (messageId: string) => void;
}) {
	const handleMessageClick = (messageId: string) => {
		onMessageClick(messageId);
		onClose();
	};

	React.useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);

	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-4 pt-16" onClick={onClose}>
			<div
				onClick={(e) => e.stopPropagation()}
				className="bg-[#313338] rounded-lg shadow-xl w-full sm:w-[420px] max-h-[calc(100vh-32px)] overflow-hidden flex flex-col"
			>
				<div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#3F4147]">
					<div className="flex items-center gap-2 flex-1 min-w-0">
						<PinIcon className="text-[#949BA4] flex-shrink-0" width={20} height={20} />
						<h2 className="text-base font-semibold text-[#DBDEE1] truncate">Pinned Messages</h2>
					</div>
					<button
						type="button"
						aria-label="Close pinned messages"
						className="p-1.5 hover:bg-[#3d4148] rounded transition-colors flex-shrink-0"
						onClick={onClose}
					>
						<CloseIcon className="text-[#DBDEE1]" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto">
					{pinnedMessages.length === 0 ? (
						<div className="text-center text-[#72767D] py-8 px-4">No pinned messages</div>
					) : (
						<div className="divide-y divide-[#404249]">
							{pinnedMessages.map((msg) => (
								<div
									key={msg.id}
									className="p-4 cursor-pointer hover:bg-[#2E3035] transition-colors group relative"
									onClick={() => handleMessageClick(msg.id)}
								>
									<div className="flex items-center gap-3 mb-2">
										<img src={msg.author.avatar} alt={msg.author.username} className="w-10 h-10 rounded-full flex-shrink-0" />
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 flex-wrap">
												<span className="text-base font-semibold" style={{ color: msg.author.color ?? "#F2F3F5" }}>
													{msg.author.username}
												</span>
												{msg.author.guildTag && msg.author.guildTag.name ? (
													<span className="text-xs text-[#B9BBBE] bg-[#2F3136] px-1 py-0.5 rounded flex items-center gap-1">
														{msg.author.guildTag.iconUrl ? (
															<img
																src={msg.author.guildTag.iconUrl}
																alt={msg.author.guildTag.name}
																className="w-3 h-3 rounded-full object-cover"
															/>
														) : null}
														<span>{msg.author.guildTag.name}</span>
													</span>
												) : null}
												{msg.author.bot && (
													<span className="text-[10px] bg-[#5865F2] text-white px-1.5 py-0.5 rounded font-medium flex-shrink-0 flex items-center gap-1">
														{msg.author.verified ? <VerifiedIcon className="w-3 h-3" /> : null}
														<span>APP</span>
													</span>
												)}
												<span className="text-xs text-[#949BA4]">{msg.timestamp ? formatTime(msg.timestamp) : ""}</span>
												{msg.editedAt ? <span className="text-xs text-[#72767D]">(edited)</span> : null}
											</div>
										</div>

										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												handleMessageClick(msg.id);
											}}
											className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#4E5058] hover:bg-[#5C5F69] text-white text-sm font-medium px-3 py-1.5 rounded flex-shrink-0"
										>
											Jump
										</button>
									</div>

									<div className="ml-[52px]">
										{typeof msg.content === "string" && msg.content && <div className="text-sm text-[#DBDEE1] mb-2">{msg.content}</div>}

										{msg.embeds && msg.embeds.length > 0 && (
											<div className="mt-2 space-y-2">
												{msg.embeds.map((e, i) => (
													<Embed
														key={i}
														{...((e as any) || {})}
														resolvedUsers={msg.resolvedUsers}
														resolvedRoles={msg.resolvedRoles}
														interaction={msg.interaction}
													/>
												))}
											</div>
										)}

										{msg.stickers && msg.stickers.length > 0 && (
											<div className="mt-2">
												{msg.stickers.map((st: any, i: number) => (
													<StickerPreview key={i} st={st} size={160} className="max-h-40 max-w-[240px] rounded object-contain" />
												))}
											</div>
										)}

										{msg.attachments && msg.attachments.length > 0 && (
											<div className="mt-2 flex flex-col gap-2">
												{msg.attachments.map((attachment, idx) => {
													const url = typeof attachment === "string" ? attachment : attachment?.url;
													const filename = attachment && typeof attachment !== "string" ? attachment.filename : undefined;
													const size = attachment && typeof attachment !== "string" ? attachment.size : undefined;
													const isImage = url && /\.(png|jpe?g|gif|webp|svg|bmp|avif)(\?|$)/i.test(url);
													const isAudio = url && /\.(mp3|wav|flac|ogg|m4a|aac|opus)(\?|$)/i.test(url);

													if (isImage) {
														return (
															<img key={idx} src={url} alt="attachment" className="max-h-60 max-w-full rounded object-contain" />
														);
													}

													if (isAudio) {
														const extractedFilename = filename || (url ? url.split("/").pop()?.split("?")[0] : "audio");
														const filesize = size ? `${(size / 1024).toFixed(2)} KB` : "";
														return (
															<div key={idx}>
																<AudioPlayer url={url} filename={extractedFilename ?? "file"} filesize={filesize} />
															</div>
														);
													}

													const getAttachmentKind = (name?: string) => {
														const target = (name || "").toLowerCase();
														if (
															/(\\.js|\\.ts|\\.tsx|\\.jsx|\\.json|\\.py|\\.java|\\.c|\\.cpp|\\.cs|\\.rb|\\.php|\\.go|\\.rs|\\.swift|\\.kt|\\.kts|\\.sh|\\.ps1|\\.bat|\\.sql|\\.html|\\.css|\\.scss|\\.sass)$/.test(
																target
															)
														)
															return "code";
														return "document";
													};

													const getAttachmentIcon = (kind: string) => {
														switch (kind) {
															case "code":
																return FileCodeIcon;
															default:
																return FileDocumentIcon;
														}
													};

													const kind = getAttachmentKind(filename || url);
													const Icon = getAttachmentIcon(kind);
													const filesize = size ? `${(size / 1024).toFixed(2)} KB` : "";
													const extractedFilename = filename || (url ? url.split("/").pop()?.split("?")[0] : "file");

													return (
														<div key={idx} className="group relative inline-block max-w-[432px]">
															<div className="flex items-center gap-3 px-4 py-3 bg-[#1e1f22] hover:bg-[#23252b] border border-[#111214] rounded-lg transition-colors">
																<Icon className="h-10 w-8 flex-shrink-0" />
																<div className="flex-1 min-w-0">
																	<a
																		href={url}
																		download
																		className="text-[15px] font-medium text-[#00a8fc] truncate hover:underline block"
																	>
																		{extractedFilename}
																	</a>
																	{filesize && <div className="text-xs text-[#b5bac1] mt-1">{filesize}</div>}
																</div>
															</div>
														</div>
													);
												})}
											</div>
										)}

										{msg.buttons && msg.buttons.length > 0 && (
											<div className="mt-2 flex flex-wrap gap-2">
												{msg.buttons.map((b: any, i: number) => {
													const styleId = Number(b.style || 1);
													let classes = "px-3 py-2 rounded text-sm transition-colors inline-flex items-center gap-2 justify-start";
													let isLinkStyle = false;
													switch (styleId) {
														case 1: // Primary
															classes += " bg-[#6652ec] hover:bg-[#5846d1] text-white";
															break;
														case 2: // Secondary
															classes += " bg-[#4E5058] hover:bg-[#5C5F69] text-white";
															break;
														case 3: // Success
															classes += " bg-[#57F287] hover:bg-[#45c767] text-black";
															break;
														case 4: // Danger
															classes += " bg-[#ED4245] hover:bg-[#C03537] text-white";
															break;
														case 5: // Link
															classes += " bg-[#4E5058] hover:bg-[#5C5F69] text-white";
															isLinkStyle = true;
															break;
														default:
															classes += " bg-[#4E5058] hover:bg-[#5C5F69] text-white";
													}

													const renderEmoji = () => {
														if (b.emojiUrl)
															return (
																<img src={b.emojiUrl} alt="emoji" className="inline w-4 h-4 align-text-bottom flex-shrink-0" />
															);
														if (!b.emoji) return null;
														if (typeof b.emoji === "string") return <span>{b.emoji}</span>;
														const em = b.emoji;
														if (em.id) {
															const animated = !!em.animated;
															const src = buildEmojiCdnUrl(String(em.id), animated, 96) || "";
															if (src) {
																return (
																	<img
																		src={src}
																		alt={em.name || "emoji"}
																		className="inline w-4 h-4 align-text-bottom flex-shrink-0"
																	/>
																);
															}
														}
														return <span>{em.name || ""}</span>;
													};

													if (isLinkStyle && b.url) {
														return (
															<a key={`btn-${i}`} href={b.url} target="_blank" rel="noopener noreferrer" className={classes}>
																{renderEmoji()}
																<span className="flex-1 truncate text-left">{b.label}</span>
															</a>
														);
													}

													return (
														<button
															key={`btn-${i}`}
															className={classes}
															onClick={(ev) => {
																ev.preventDefault();
																if (b.url) window.open(b.url, "_blank");
															}}
															type="button"
														>
															{renderEmoji()}
															<span className="flex-1 truncate text-left">{b.label}</span>
														</button>
													);
												})}
											</div>
										)}

										{msg.selects && msg.selects.length > 0 && (
											<div className="mt-2 flex flex-col gap-2">
												{msg.selects.map((s: any, si: number) => (
													<div key={`select-${si}`} className="flex w-auto max-w-[432px] my-2 min-w-0">
														<div className="flex-1 rounded-md px-3 py-2 bg-[#2C2F33] border border-[#1e2124]">
															<div className="flex items-center justify-between text-sm text-[#B5BAC1] cursor-default">
																<div className="truncate">{s.placeholder || "Select"}</div>
																<ChevronDownIcon className="ml-2 text-[#949BA4] w-4 h-4 flex-shrink-0" />
															</div>
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
