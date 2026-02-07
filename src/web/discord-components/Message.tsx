import React from "react";
import type { MessageProps } from "../types/message";
import AudioPlayer from "./AudioPlayer";
import VideoPlayer from "./VideoPlayer";
import ChannelPinnedMessage from "./ChannelPinnedMessage";
import Embed from "./Embed";
import ForwardedMessage from "./ForwardedMessage";
import ChevronDownIcon from "./icons/ChevronDownIcon";
import ExternalLinkIcon from "./icons/ExternalLinkIcon";
import VerifiedIcon from "./icons/VerifiedIcon";
import FileAudioIcon from "./icons/FileAudioIcon";
import FileCodeIcon from "./icons/FileCodeIcon";
import FileDocumentIcon from "./icons/FileDocumentIcon";
import Reply from "./Reply";
import StickerPreview from "./StickerPreview";
import UserJoinMessage from "./UserJoinMessage";
import { formatDate, formatTime } from "./utils/date";
import { parseMarkdown } from "./utils/markdown";
import { buildAvatarUrl } from "../helpers/avatarHelpers";
import { buildEmojiCdnUrl } from "../helpers/cdnHelpers";
import {
	getAttachmentKind,
	formatFileSize,
	isImageUrl,
	isAudioUrl,
	isVideoUrl,
	extractFilenameFromUrl,
	sanitizeMarkdownString,
	timeAgo
} from "./messageHelpers";

function renderCommandLine(
	interaction: { name?: string; user?: { id?: string; username?: string } },
	author?: { username?: string; bot?: boolean; verified?: boolean; avatar?: string },
	resolvedUsers?: Record<string, { displayName?: string; avatar?: string }>,
	defaultAvatar?: string
) {
	if (!interaction?.name || !interaction?.user?.username) return null;

	const username = interaction.user.username;
	const userId = interaction.user.id;
	const displayName = userId && resolvedUsers?.[userId]?.displayName;
	const commandName = interaction.name;

	let userAvatar = defaultAvatar;
	if (userId && resolvedUsers?.[userId]?.avatar) {
		const avatarHash = resolvedUsers[userId].avatar as string;
		userAvatar = /^https?:\/\//i.test(avatarHash) ? avatarHash : buildAvatarUrl(String(userId), avatarHash);
	}

	return (
		<div className="flex items-center text-sm mb-1 relative" style={{ marginLeft: "-56px", paddingLeft: "56px" }}>
			<div className="flex items-center gap-1.5">
				{userAvatar && <img src={userAvatar} alt="" className="w-4 h-4 rounded-full" />}

				<span className="text-[#b5bac1] font-medium">{username}</span>
				{displayName && (
					<>
						<svg width="12" height="12" viewBox="0 0 24 24" className="text-[#b5bac1]">
							<path
								fill="currentColor"
								d="M2.06 7.61c-.25.95.31 1.92 1.26 2.18l4.3 1.15c.94.25 1.91-.31 2.17-1.26l1.15-4.3c.25-.94-.31-1.91-1.26-2.17l-4.3-1.15c-.94-.25-1.91.31-2.17 1.26l-1.15 4.3ZM12.98 7.87a2 2 0 0 0 1.75 2.95H20a2 2 0 0 0 1.76-2.95l-2.63-4.83a2 2 0 0 0-3.51 0l-2.63 4.83ZM5.86 13.27a.89.89 0 0 1 1.28 0l.75.77a.9.9 0 0 0 .54.26l1.06.12c.5.06.85.52.8 1.02l-.13 1.08c-.02.2.03.42.14.6l.56.92c.27.43.14 1-.28 1.26l-.9.58a.92.92 0 0 0-.37.48l-.36 1.02a.9.9 0 0 1-1.15.57l-1-.36a.89.89 0 0 0-.6 0l-1 .36a.9.9 0 0 1-1.15-.57l-.36-1.02a.92.92 0 0 0-.37-.48l-.9-.58a.93.93 0 0 1-.28-1.26l.56-.93c.11-.17.16-.38.14-.59l-.12-1.08c-.06-.5.3-.96.8-1.02l1.05-.12a.9.9 0 0 0 .54-.26l.75-.77ZM18.52 13.71a1.1 1.1 0 0 0-2.04 0l-.46 1.24c-.19.5-.57.88-1.07 1.07l-1.24.46a1.1 1.1 0 0 0 0 2.04l1.24.46c.5.19.88.57 1.07 1.07l.46 1.24c.35.95 1.7.95 2.04 0l.46-1.24c.19-.5.57-.88 1.07-1.07l1.24-.46a1.1 1.1 0 0 0 0-2.04l-1.24-.46a1.8 1.8 0 0 1-1.07-1.07l-.46-1.24Z"
							/>
						</svg>
						<span className="text-white font-semibold">{displayName}</span>
					</>
				)}
				<span className="text-[#b5bac1]">used</span>

				<span className="bg-[#141437] text-[#6896f1] font-medium px-1.5 py-0.5 rounded inline-flex items-center gap-1">
					<svg width="12" height="12" viewBox="0 0 24 24" className="text-[#6896f1]">
						<path
							fill="currentColor"
							d="M2.06 7.61c-.25.95.31 1.92 1.26 2.18l4.3 1.15c.94.25 1.91-.31 2.17-1.26l1.15-4.3c.25-.94-.31-1.91-1.26-2.17l-4.3-1.15c-.94-.25-1.91.31-2.17 1.26l-1.15 4.3ZM12.98 7.87a2 2 0 0 0 1.75 2.95H20a2 2 0 0 0 1.76-2.95l-2.63-4.83a2 2 0 0 0-3.51 0l-2.63 4.83ZM5.86 13.27a.89.89 0 0 1 1.28 0l.75.77a.9.9 0 0 0 .54.26l1.06.12c.5.06.85.52.8 1.02l-.13 1.08c-.02.2.03.42.14.6l.56.92c.27.43.14 1-.28 1.26l-.9.58a.92.92 0 0 0-.37.48l-.36 1.02a.9.9 0 0 1-1.15.57l-1-.36a.89.89 0 0 0-.6 0l-1 .36a.9.9 0 0 1-1.15-.57l-.36-1.02a.92.92 0 0 0-.37-.48l-.9-.58a.93.93 0 0 1-.28-1.26l.56-.93c.11-.17.16-.38.14-.59l-.12-1.08c-.06-.5.3-.96.8-1.02l1.05-.12a.9.9 0 0 0 .54-.26l.75-.77ZM18.52 13.71a1.1 1.1 0 0 0-2.04 0l-.46 1.24c-.19.5-.57.88-1.07 1.07l-1.24.46a1.1 1.1 0 0 0 0 2.04l1.24.46c.5.19.88.57 1.07 1.07l.46 1.24c.35.95 1.7.95 2.04 0l.46-1.24c.19-.5.57-.88 1.07-1.07l1.24-.46a1.1 1.1 0 0 0 0-2.04l-1.24-.46a1.8 1.8 0 0 1-1.07-1.07l-.46-1.24Z"
						/>
					</svg>
					{commandName}
				</span>
			</div>
		</div>
	);
}

export default function Message(props: MessageProps) {
	const {
		id,
		author,
		timestamp,
		editedAt,
		content,
		attachments,
		embeds,
		selects,
		replyTo,
		poll,
		forwardedFrom,
		forwardedMessage,
		reactions,
		compact = false,
		resolvedUsers,
		resolvedRoles,
		resolvedChannels,
		channelGuildId,
		emojiUrls,
		stickers,
		interaction,
		messageType,
		pinned,
		onPinIconClick,
		referencedMessage
	} = props;
	const [brokenImages, setBrokenImages] = React.useState<Set<string>>(new Set());

	const handleImageError = (url: string) => {
		setBrokenImages((prev) => new Set([...prev, url]));
	};

	const handleReplyClick = (ev: React.MouseEvent) => {
		ev.preventDefault();
		let targetId = (replyTo as any)?.id || (replyTo as any)?.messageId || (replyTo as any)?.messageIdString || (replyTo as any)?.reference;
		if (!targetId) return;
		targetId = String(targetId);
		let el = document.getElementById(targetId);
		if (!el) el = document.querySelector(`[data-message-id="${targetId}"]`) as HTMLElement | null;
		if (el) {
			document.querySelectorAll(".message-highlight").forEach((e) => e.classList.remove("message-highlight"));
			el.classList.add("message-highlight");
			el.scrollIntoView({ behavior: "smooth", block: "center" });
			setTimeout(() => {
				el?.classList.remove("message-highlight");
			}, 2000);
		}
	};

	const handleForwardClick = (ev: React.MouseEvent) => {
		ev.preventDefault();
		let targetId =
			(forwardedMessage as any)?.id ||
			(forwardedMessage as any)?.messageId ||
			(forwardedMessage as any)?.originalId ||
			(forwardedMessage as any)?.reference;
		if (!targetId) return;
		targetId = String(targetId);
		let el = document.getElementById(targetId);
		if (!el) el = document.querySelector(`[data-message-id="${targetId}"]`) as HTMLElement | null;
		if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
	};

	const dateObj = timestamp ? new Date(timestamp) : null;
	let tagDate = dateObj ? formatDate(dateObj) : "";
	let shortTime = dateObj ? formatTime(dateObj) : "";
	tagDate = tagDate.replace(/\s+(AM|PM)$/, "\u00A0$1");
	shortTime = shortTime.replace(/\s+(AM|PM)$/, "\u00A0$1");
	const timeAgoDisplay = dateObj
		? (() => {
				const diff = Math.floor((Date.now() - dateObj.getTime()) / 1000);
				if (Math.abs(diff) < 60) return `${Math.abs(diff)}s ago`;
				if (Math.abs(diff) < 3600) return `${Math.round(Math.abs(diff) / 60)}m ago`;
				if (Math.abs(diff) < 86400) return `${Math.round(Math.abs(diff) / 3600)}h ago`;
				return formatDate(dateObj);
			})()
		: "";

	const relativeTimestamp = dateObj ? timeAgo(dateObj) : "";

	const BOT_AVATAR = "/profile/bot.png";

	const ensureKeys = (node: any, prefix: string): any => {
		if (node === null || node === undefined) return node;
		const arr = React.Children.toArray(node as any);
		return arr.map((child: any, i: number) => {
			if (React.isValidElement(child)) {
				const childChildren = (child as any).props && (child as any).props.children;
				const newChildren = ensureKeys(childChildren, `${prefix}-${i}`);
				const key = (child as any).key != null ? (child as any).key : `${prefix}-${i}`;
				try {
					return React.cloneElement(child, { key }, newChildren);
				} catch (e) {
					return React.cloneElement(child, {}, newChildren);
				}
			}
			return child;
		});
	};

	const urlsToHide = new Set<string>();
	if (attachments) {
		attachments.forEach((a: any) => {
			if (a?.url) urlsToHide.add(a.url);
			if (a?.embedUrl) urlsToHide.add(a.embedUrl);
		});
	}
	const filteredEmbeds = embeds
		? embeds.filter((e: any) => {
				const imgUrl = e?.image?.url || e?.thumbnail?.url;
				const isEmojiEmbed = imgUrl && /cdn\.discordapp\.com\/emojis\//.test(imgUrl) && !e?.title && !e?.description && !e?.author;
				return !isEmojiEmbed;
			})
		: [];
	if (filteredEmbeds) {
		filteredEmbeds.forEach((e: any) => {
			if (e?.url) urlsToHide.add(e.url);
			if (e?.image?.url) urlsToHide.add(e.image.url);
			if (e?.thumbnail?.url) urlsToHide.add(e.thumbnail.url);
		});
	}

	function stripDuplicateLinks(s: string, extra?: Set<string>) {
		let out = s;
		const all = new Set<string>(urlsToHide);
		if (extra) extra.forEach((u) => all.add(u));
		all.forEach((u) => {
			out = out.split(u).join("");
		});
		return out;
	}

	const [hover, setHover] = React.useState(false);

	function StickerRenderer({ st }: { st: any }) {
		return (
			<div className="mb-2" style={{ width: 160, height: 160 }}>
				<StickerPreview st={st} size={160} className="w-[160px] h-[160px]" />
			</div>
		);
	}

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

	const renderContent = (c: unknown) => {
		if (typeof c === "string") {
			const localHide = new Set<string>();
			const emojiTokenRegex = /<(a)?:([^:>]+):(\d+)>/g;
			let em: RegExpExecArray | null;
			while ((em = emojiTokenRegex.exec(c)) !== null) {
				const animated = !!em[1];
				const id = em[3];
				const token = em[0];
				const src = emojiUrls && emojiUrls[token] ? emojiUrls[token] : buildEmojiCdnUrl(id, animated, 96) || "";
				if (src) localHide.add(src);
			}
			const text = sanitizeMarkdownString(stripDuplicateLinks(c, localHide));
			return parseMarkdown(text, resolvedUsers, resolvedRoles as any, resolvedChannels, channelGuildId);
		}

		const rendered = parseMarkdown(c as any, resolvedUsers, resolvedRoles as any, resolvedChannels, channelGuildId);

		try {
			const problems: any[] = [];
			const walk = (node: any, path: string[]) => {
				if (node === null || node === undefined) return;
				if (Array.isArray(node)) {
					node.forEach((n, i) => {
						if (React.isValidElement(n) && (n as any).key == null) {
							problems.push({ path: [...path, `[${i}]`].join("/"), type: "element-no-key", el: (n as any).type });
						}
						walk(n, [...path, `[${i}]`]);
					});
					return;
				}
				if (React.isValidElement(node)) {
					const key = (node as any).key;
					if (key == null) {
						problems.push({ path: path.join("/"), type: "element-no-key", el: (node as any).type });
					}
					const children = (node as any).props && (node as any).props.children;
					if (children) walk(children, [...path, String((node as any).type || "el")]);
					return;
				}
				if (typeof node === "object") {
					React.Children.forEach(node, (child: any, i: number) => {
						walk(child, [...path, `child(${i})`]);
					});
				}
			};
			const ensureKeys = (node: any, prefix: string): any => {
				if (node === null || node === undefined) return node;
				const arr = React.Children.toArray(node as any);
				return arr.map((child: any, i: number) => {
					if (React.isValidElement(child)) {
						const childChildren = (child as any).props && (child as any).props.children;
						const newChildren = ensureKeys(childChildren, `${prefix}-${i}`);
						if ((child as any).key == null) {
							return React.cloneElement(child, { key: `${prefix}-${i}` }, newChildren);
						}

						return React.cloneElement(child, {}, newChildren);
					}
					return child;
				});
			};

			const fixed = ensureKeys(rendered, `message-${id}`);
			walk(fixed, [`message-${id}`]);
			if (problems.length > 0) {
				console.warn("[renderContent] missing-key problems for message:", id, problems.slice(0, 20));
			}
		} catch (e) {
			console.warn("[renderContent] key-check failed", e);
		}

		return rendered;
	};

	function renderSegmentWithEmojis(text: string): React.ReactNode[] {
		const out: React.ReactNode[] = [];
		const emojiRegex = /<(a)?:([^:>]+):(\d+)>/g;
		let last = 0;
		let m: RegExpExecArray | null;
		let tsCallIndex = 0;
		while ((m = emojiRegex.exec(text)) !== null) {
			if (m.index > last) {
				const part = text.substring(last, m.index);
				out.push(...renderTextWithTimestamps(part, tsCallIndex++));
			}
			if (m.index > 0 && text[m.index - 1] === "\\") {
				out.push(m[0].replace(/\\/g, ""));
			} else {
				const animated = !!m[1];
				const name = m[2];
				const id = m[3];
				const token = m[0];
				const src = emojiUrls && emojiUrls[token] ? emojiUrls[token] : buildEmojiCdnUrl(id, animated, 96) || "";
				if (src) {
					out.push(<img key={`e-${id}-${m.index}`} src={src} alt={name} className="inline h-6 w-6 align-text-bottom mr-0.5" />);
				}
			}
			last = emojiRegex.lastIndex;
		}
		if (last < text.length) out.push(...renderTextWithTimestamps(text.substring(last), tsCallIndex++));
		return React.Children.toArray(out);
	}

	function renderTextWithTimestamps(s: string, callIndex: number = 0): React.ReactNode[] {
		const out: React.ReactNode[] = [];
		const tsRegex = /<t:(\d+)(?::([tTfFR]))?>/g;
		let last = 0;
		let m: RegExpExecArray | null;

		function renderTextWithCommands(str: string, keyBase: string) {
			const parts: React.ReactNode[] = [];
			const cmdRegex = /<\/([A-Za-z0-9_-]+):(\d+)>/g;
			let l = 0;
			let mm: RegExpExecArray | null;
			let idx = 0;
			while ((mm = cmdRegex.exec(str)) !== null) {
				if (mm.index > l) {
					parts.push(
						<React.Fragment key={`cmd-txt-${keyBase}-${l}`}>
							{parseMarkdown(str.substring(l, mm.index), resolvedUsers, resolvedRoles as any, resolvedChannels, channelGuildId)}
						</React.Fragment>
					);
				}
				const name = mm[1];
				parts.push(
					<span
						key={`cmd-pill-${keyBase}-${idx}`}
						className="inline-flex items-center rounded px-2 py-0.5 text-sm font-medium mr-1"
						style={{ backgroundColor: "#1d193f", color: "#9697ec" }}
					>
						{`/${name}`}
					</span>
				);
				l = cmdRegex.lastIndex;
				idx++;
			}
			if (l < str.length)
				parts.push(
					<React.Fragment key={`cmd-txt-tail-${keyBase}`}>
						{parseMarkdown(str.substring(l), resolvedUsers, resolvedRoles as any, resolvedChannels, channelGuildId)}
					</React.Fragment>
				);
			return parts;
		}

		function TimestampToken({ sec, display, full, k }: { sec: number; display: string; full: string; k: string }) {
			const [visible, setVisible] = React.useState(false);
			const [pos, setPos] = React.useState<{ left: number; top: number } | null>(null);
			const wrapRef = React.useRef<HTMLSpanElement | null>(null);
			const tipRef = React.useRef<HTMLDivElement | null>(null);

			const onEnter = () => {
				setVisible(true);
				requestAnimationFrame(() => {
					const wrap = wrapRef.current;
					const tip = tipRef.current;
					if (!wrap || !tip) return;
					const wRect = wrap.getBoundingClientRect();
					const tRect = tip.getBoundingClientRect();
					const centerX = wRect.left + wRect.width / 2;
					const left = Math.min(Math.max(8, centerX - tRect.width / 2), window.innerWidth - tRect.width - 8);
					const top = Math.max(8, wRect.top - tRect.height - 8);
					setPos({ left, top });
				});
			};
			const onLeave = () => setVisible(false);

			return (
				<span key={k} ref={wrapRef} onMouseEnter={onEnter} onMouseLeave={onLeave} className="inline-block">
					<span className="text-sm bg-[#242427] p-1 cursor-default border border-[#242427] rounded-md">{display}</span>
					<div
						ref={tipRef}
						className="timestamp-tooltip"
						style={{
							position: "fixed",
							left: pos ? `${pos.left}px` : "50%",
							top: pos ? `${pos.top}px` : "-9999px",
							transform: pos ? "none" : "translateX(-50%)",
							opacity: visible ? 1 : 0,
							pointerEvents: "none",
							transition: "opacity 150ms",
							zIndex: 99999,
							background: "#242427",
							color: "#fff",
							fontSize: "14px",
							fontWeight: 600,
							padding: "8px 12px",
							borderRadius: 8,
							boxShadow: "0 8px 24px rgba(0,0,0,0.8)",
							whiteSpace: "nowrap"
						}}
					>
						{full}
					</div>
				</span>
			);
		}
		while ((m = tsRegex.exec(s)) !== null) {
			if (m.index > last) {
				const substring = s.substring(last, m.index);
				out.push(
					<React.Fragment key={`ts-pre-${id}-${callIndex}-${last}-${m.index}`}>
						{renderTextWithCommands(substring, `${callIndex}-${last}-${m.index}`)}
					</React.Fragment>
				);
			}
			const sec = Number(m[1]);
			const fmt = m[2];
			const date = new Date(sec * 1000);
			let display = "";
			if (fmt === "R") {
				display = timeAgo(date);
			} else {
				display = formatDate(date);
			}

			const full = formatDate(date);

			out.push(
				<TimestampToken
					key={`ts-${id}-${callIndex}-${sec}-${m.index}`}
					sec={sec}
					display={display}
					full={full}
					k={`ts-${id}-${callIndex}-${sec}-${m.index}`}
				/>
			);

			last = tsRegex.lastIndex;
		}
		if (last < s.length) {
			const substring = s.substring(last);
			out.push(
				<React.Fragment key={`ts-tail-${id}-${callIndex}-${last}`}>{renderTextWithCommands(substring, `${callIndex}-tail-${last}`)}</React.Fragment>
			);
		}
		return React.Children.toArray(out);
	}

	const isPollEnd = messageType === 46 && embeds && embeds.length > 0 && (embeds[0] as any)?.fields;
	const pollEndContent = isPollEnd
		? (() => {
				const fields = ((embeds as any[])[0] as any).fields;
				const pollQuestionField = fields.find((f: any) => f.name === "poll_question_text");
				const totalVotesField = fields.find((f: any) => f.name === "total_votes");

				if (!pollQuestionField || !totalVotesField) return null;

				const pollQuestion = pollQuestionField.value;
				const totalVotes = parseInt(totalVotesField.value, 10) || 0;

				const answerFields = fields.filter((f: any) => f.name !== "poll_question_text" && f.name !== "total_votes");

				const voteCounts = answerFields.map((f: any) => parseInt(f.value, 10) || 0);
				const maxVotes = Math.max(...voteCounts, 0);
				const highestPct = totalVotes > 0 ? Math.round((maxVotes / totalVotes) * 100) : 0;
				const tiedOptions = answerFields.filter((f: any) => parseInt(f.value, 10) === maxVotes).length;

				let resultText = "The results were tied";
				if (tiedOptions === 1 && maxVotes > 0) {
					resultText = `${highestPct}%`;
				}
				const isTied = tiedOptions > 1;

				return { pollQuestion, totalVotes, resultText, highestPct, isTied };
			})()
		: null;

	const pollReferenceId =
		(replyTo as any)?.id || (replyTo as any)?.messageId || (replyTo as any)?.messageIdString || (replyTo as any)?.reference || undefined;
	const scrollToId = (targetId?: string) => {
		if (!targetId) return;
		const idStr = String(targetId);
		let el = document.getElementById(idStr);
		if (!el) el = document.querySelector(`[data-message-id="${idStr}"]`) as HTMLElement | null;
		if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
	};

	const _messageTree = (
		<>
			{isPollEnd && pollEndContent ? (
				<div className="flex gap-3 py-1 relative transition-colors duration-300 w-full mb-2">
					<svg
						aria-hidden="true"
						role="img"
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						fill="none"
						viewBox="0 0 24 24"
						className="flex-shrink-0 mt-2"
					>
						<path
							fill="#B5BAC1"
							d="M2 5c0-1.1.9-2 2-2h16a2 2 0 1 1 0 4H4a2 2 0 0 1-2-2ZM2 12c0-1.1.9-2 2-2h6a2 2 0 1 1 0 4H4a2 2 0 0 1-2-2ZM4 17a2 2 0 1 0 0 4h12a2 2 0 1 0 0-4H4Z"
						/>
					</svg>

					<div className="flex-1 min-w-0  ml-3">
						<div className="text-sm text-[#B5BAC1] mb-2">
							<span className="font-semibold" style={{ color: author.color ?? "#FFFFFF" }}>
								{author.username}
							</span>
							<span className="text-[#B5BAC1]">'s poll </span>
							<button
								type="button"
								className="text-white font-semibold hover:underline"
								onClick={(ev) => {
									ev.preventDefault();
									scrollToId(pollReferenceId);
								}}
							>
								{pollEndContent.pollQuestion}
							</button>
							<span className="text-[#B5BAC1]"> has closed. </span>
							<span className="text-xs text-[#72767D]">{timeAgoDisplay}</span>
						</div>

						<div className="bg-[#131416] rounded-lg p-4 max-w-md">
							<div className="flex items-center justify-between gap-4">
								<div className="text-left">
									<div className="text-sm text-[#DBDEE1] font-semibold">The results were tied</div>
									<div className="text-sm text-[#72767D] font-semibold">{pollEndContent.resultText}</div>
									{pollEndContent.isTied ? (
										<div className="text-2xl text-[#DBDEE1] font-extrabold mt-1">{pollEndContent.highestPct}%</div>
									) : null}
								</div>

								<button
									className="px-4 py-2 rounded text-sm bg-[#404249] text-white hover:bg-[#4a4d54] transition-colors flex-shrink-0 whitespace-nowrap"
									onClick={(ev) => {
										ev.preventDefault();
										scrollToId(pollReferenceId);
									}}
								>
									View Poll
								</button>
							</div>
						</div>
					</div>
				</div>
			) : messageType === 7 ? (
				<article id={id} data-message-id={id} className="py-0.5">
					<UserJoinMessage username={author.username} />
				</article>
			) : messageType === 6 ? (
				<article id={id} data-message-id={id} className="py-0.5">
					<ChannelPinnedMessage
						message={props as MessageProps}
						referencedMessage={referencedMessage}
						onOpenPinnedMessages={onPinIconClick || (() => {})}
						onNavigateToMessage={props.onNavigateToMessage}
					/>
				</article>
			) : (
				<article
					id={id}
					data-message-id={id}
					className={`flex gap-3 ${compact ? "py-0.5 mt-0" : "py-0.5 mt-4"} relative transition-colors duration-300 w-full ${interaction?.name ? "pr-4" : ""}`}
					onMouseEnter={() => setHover(true)}
					onMouseLeave={() => setHover(false)}
				>
					<div className="w-10 shrink-0 flex items-start justify-start mt-0.5 relative">
						{compact ? (
							<div className="relative inline-block w-full text-right pr-1">
								<span className={`text-xs text-[#949BA4] transition-opacity ${hover ? "opacity-100" : "opacity-0"}`} aria-hidden>
									{timestamp ? shortTime : ""}
								</span>
							</div>
						) : (
							<>
								{(replyTo || interaction?.name) && (
									<div className="absolute left-[20px] top-[5px] w-7 h-[10px] border-l-2 border-t-2 border-[#4f545c] rounded-tl-[8px]" />
								)}
								<img
									src={author.avatar || BOT_AVATAR}
									alt="avatar"
									className={`w-10 h-10 rounded-full object-cover mt-1 ${replyTo || interaction?.name ? "mt-5" : ""}`}
								/>
							</>
						)}
					</div>

					<div className="flex-1 min-w-0">
						{replyTo && (
							<Reply
								replyTo={replyTo}
								onReplyClick={handleReplyClick}
								defaultAvatar={BOT_AVATAR}
								resolvedUsers={resolvedUsers}
								resolvedRoles={resolvedRoles}
								resolvedChannels={resolvedChannels}
							/>
						)}

						{compact ? (
							<>
								<div className="text-base text-[#DBDEE1] leading-[1.375rem] min-h-[1.375rem]">
									{content ? renderContent(content) : null}
									{editedAt ? <span className="ml-1 text-xs text-[#72767D]">(edited)</span> : null}
								</div>
							</>
						) : (
							<>
								{!compact && interaction?.name && renderCommandLine(interaction, author, resolvedUsers, BOT_AVATAR)}

								<header className="flex items-center gap-2">
									<strong className="text-base font-semibold flex items-center gap-1">
										<span style={{ color: author.color ?? "#FFFFFF" }}>{author.username}</span>

										{author.guildTag && author.guildTag.name ? (
											<span className="ml-0.5 text-xs text-[#B9BBBE] bg-[#2F3136] px-1 py-0.5 rounded flex items-center gap-1">
												{author.guildTag.iconUrl ? (
													<img
														src={author.guildTag.iconUrl}
														alt={author.guildTag.name}
														className="w-3 h-3 rounded-full object-cover"
													/>
												) : null}
												<span>{author.guildTag.name}</span>
											</span>
										) : null}
										{author.bot ? (
											<span className="ml-0.5 text-xs text-white bg-[#5865F2] rounded flex items-center botTag">
												{author.verified ? <VerifiedIcon /> : null}
												<span className="leading-none">APP</span>
											</span>
										) : null}
									</strong>

									<span className="text-sm text-[#949BA4] cursor-default flex items-center gap-1 whitespace-nowrap" title={relativeTimestamp}>
										{timestamp ? <span className="rem_82f0793afa59e5dc-botTag botTag ml-0.5">{tagDate}</span> : ""}
									</span>
									{editedAt ? <span className="ml-1 text-xs text-[#72767D]">(edited)</span> : null}
								</header>

								<div className="mt-0.5 text-base text-[#DBDEE1] leading-tight">{content ? renderContent(content) : null}</div>
							</>
						)}

						{forwardedFrom && forwardedMessage ? (
							<ForwardedMessage
								message={forwardedMessage}
								brokenImages={brokenImages}
								onImageError={handleImageError}
								renderContent={renderContent}
								defaultAvatar={BOT_AVATAR}
							/>
						) : null}

						{stickers && stickers.length ? (
							<div className="mt-2">
								{stickers.map((st: any, i: number) => (
									<StickerRenderer key={`st-${i}`} st={st} />
								))}
							</div>
						) : null}

						{attachments && attachments.length ? (
							<div className="mt-2 flex flex-col gap-2">
								{attachments.map((a, i) => {
									const url = (a && (a.url || (typeof a === "string" ? a : undefined))) || "";
									let filename = a && (a.filename as string | undefined);
									if (!filename) filename = extractFilenameFromUrl(url) || "file";
									const filesize = formatFileSize(a && a.size, a && a.size_human);
									const imageLike = isImageUrl(url);
									const audioLike = isAudioUrl(url);
									const videoLike = isVideoUrl(url);
									const isBroken = brokenImages.has(url || "");

									if (imageLike && !isBroken) {
										return (
											<div key={`att-${i}`} className="mb-2 max-w-[520px]">
												<img
													src={url}
													alt={filename}
													className={`rounded w-full h-auto ${isBroken ? "image-error" : ""}`}
													onError={() => handleImageError(url || "")}
												/>
											</div>
										);
									}

									if (audioLike) {
										return (
											<div key={`att-${i}`}>
												<AudioPlayer url={url} filename={filename} filesize={filesize} />
											</div>
										);
									}

									if (videoLike) {
										return (
											<div key={`att-${i}`}>
												<VideoPlayer url={url} filename={filename} filesize={filesize} />
											</div>
										);
									}

									const kind = getAttachmentKind(filename, url);
									const Icon = getAttachmentIcon(kind);

									return (
										<div key={`att-${i}`} className="group relative inline-block max-w-[432px]">
											<div className="flex items-center gap-3 px-4 py-3 bg-[#1e1f22] hover:bg-[#23252b] border border-[#111214] rounded-lg transition-colors">
												<Icon className="h-10 w-8 flex-shrink-0" />
												<div className="flex-1 min-w-0">
													<a href={url} download className="text-[15px] font-medium text-[#00a8fc] truncate hover:underline block">
														{filename}
													</a>
													<div className="text-xs text-[#b5bac1] mt-1">{filesize}</div>
												</div>
												<a
													href={url}
													download
													className="hover:bg-[#2c2f33] p-2 rounded transition-colors flex-shrink-0"
													title="Download"
												>
													<svg width="20" height="20" viewBox="0 0 24 24">
														<path
															fill="#b5bac1"
															d="M12 2a1 1 0 0 1 1 1v10.59l3.3-3.3a1 1 0 1 1 1.4 1.42l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 1 1 1.4-1.42l3.3 3.3V3a1 1 0 0 1 1-1ZM3 20a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2H3Z"
														/>
													</svg>
												</a>
											</div>
										</div>
									);
								})}
							</div>
						) : null}

						{filteredEmbeds && filteredEmbeds.length ? (
							<div className="mt-2 space-y-2">
								{filteredEmbeds.map((e, i) => (
									<Embed
										key={i}
										{...((e as any) || {})}
										resolvedUsers={resolvedUsers}
										resolvedRoles={resolvedRoles}
										resolvedChannels={resolvedChannels}
										interaction={interaction}
									/>
								))}
							</div>
						) : null}

						{poll && (poll.question || (Array.isArray(poll.options) && poll.options.length > 0))
							? (() => {
									const isClosed = poll.closed || (poll.endsAt && new Date(poll.endsAt) < new Date());
									return (
										<div className="mt-3 bg-[#131416] rounded-lg p-4 max-w-md">
											{poll.question ? <div className="text-base font-semibold text-white mb-3">{poll.question}</div> : null}
											<div className="flex flex-col gap-2">
												{(() => {
													const total =
														poll.totalVotes ??
														(Array.isArray(poll.options) ? poll.options.reduce((s: number, o: any) => s + (o.count ?? 0), 0) : 0);
													const maxCount = Array.isArray(poll.options)
														? Math.max(...poll.options.map((o: any) => o.count ?? 0), 0)
														: 0;
													return Array.isArray(poll.options)
														? poll.options.map((opt: any, oi: number) => {
																const count = opt.count ?? 0;
																const pct = total > 0 ? Math.round((count / total) * 100) : 0;
																const hasVotes = count > 0;
																const isWinner = isClosed && count === maxCount && total > 0;
																const barColor = isClosed
																	? "rgba(46, 204, 113, 0.2)"
																	: isWinner
																		? "rgba(46, 204, 113, 0.18)"
																		: "rgba(88, 101, 242, 0.15)";
																const borderColor = isClosed ? "#2ecc71" : isWinner ? "#2ecc71" : "#5865F2";
																return (
																	<div
																		key={`poll-${oi}`}
																		className={`relative bg-[#1E1F22] rounded-lg p-3 border-2 ${hasVotes ? "" : "border-transparent"} overflow-hidden`}
																		style={{
																			borderColor: hasVotes ? borderColor : undefined
																		}}
																	>
																		{hasVotes && (
																			<div
																				style={{
																					position: "absolute",
																					left: 0,
																					top: 0,
																					bottom: 0,
																					width: `${pct}%`,
																					backgroundColor: barColor
																				}}
																			/>
																		)}
																		<div className="relative flex items-center justify-between">
																			<div className="text-base text-white font-medium">{opt.label}</div>
																			<div className="flex items-center gap-2">
																				<div className="text-sm text-[#B5BAC1]">
																					{count} vote
																					{count !== 1 ? "s" : ""}
																				</div>
																				<div className="text-sm font-semibold text-white">{pct}%</div>
																			</div>
																		</div>
																	</div>
																);
															})
														: null;
												})()}
											</div>
											<div className="mt-3 flex items-center justify-between text-sm">
												<div className="text-white font-semibold">
													{poll.totalVotes || 0} vote
													{(poll.totalVotes || 0) !== 1 ? "s" : ""}
												</div>
												{isClosed ? (
													<div className="text-[#B5BAC1]">Poll closed</div>
												) : poll.endsAt ? (
													<div className="text-[#B5BAC1]">
														{(() => {
															const end = new Date(poll.endsAt);
															const now = new Date();
															const diff = Math.floor((end.getTime() - now.getTime()) / 1000);
															const hours = Math.floor(diff / 3600);
															const mins = Math.floor((diff % 3600) / 60);
															return `${hours}h ${mins}m left`;
														})()}
													</div>
												) : null}
											</div>
										</div>
									);
								})()
							: null}

						{props.buttons && props.buttons.length ? (
							<div className="mt-2 flex flex-wrap gap-2">
								{props.buttons.map((b: any, i: number) => {
									const styleId = Number(b.style || 1);
									let classes = "px-3 py-1 rounded text-sm transition-colors inline-flex items-center gap-2 justify-start";
									let isLinkStyle = false;
									switch (styleId) {
										case 1: // Primary
											classes += " bg-[#6652ec] hover:bg-[#5846d1] text-white";
											break;
										case 2: // Secondary
											classes += " bg-[#18181b] hover:bg-[#0f0f10] text-white";
											break;
										case 3: // Success
											classes += " bg-[#57F287] hover:bg-[#45c767] text-black";
											break;
										case 4: // Danger
											classes += " bg-[#ED4245] hover:bg-[#C03537] text-white";
											break;
										case 5: // Link
											classes += " bg-[#18181b] hover:bg-[#0f0f10] text-white";
											isLinkStyle = true;
											break;
										default:
											classes += " bg-[#2F3136] text-white";
									}

									const renderEmoji = () => {
										if (b.emojiUrl)
											return <img src={b.emojiUrl} alt="emoji" className="inline w-4 h-4 mr-1 align-text-bottom flex-shrink-0" />;
										if (!b.emoji) return null;
										if (typeof b.emoji === "string") return <span className="mr-1">{b.emoji}</span>;
										const em = b.emoji;
										if (em.id) {
											const animated = !!em.animated;
											const src = buildEmojiCdnUrl(String(em.id), animated, 96) || "";
											if (src) {
												return (
													<img src={src} alt={em.name || "emoji"} className="inline w-4 h-4 mr-1 align-text-bottom flex-shrink-0" />
												);
											}
										}
										return <span className="mr-1">{em.name || ""}</span>;
									};

									const contentNodes = (
										<>
											{renderEmoji()}
											<span className="flex-1 truncate text-left">{b.label}</span>
											{isLinkStyle ? <ExternalLinkIcon /> : null}
										</>
									);

									if (isLinkStyle && b.url) {
										return (
											<a key={`btn-${i}`} href={b.url} target="_blank" rel="noopener noreferrer" className={classes}>
												{contentNodes}
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
												else if (b.customId) console.log("button clicked", b.customId);
											}}
											type="button"
										>
											{contentNodes}
										</button>
									);
								})}
							</div>
						) : null}

						{props.selects && props.selects.length ? (
							<div className="mt-2 flex flex-col gap-2">
								{props.selects.map((s: any, si: number) => (
									<div key={`select-${si}`} className="flex w-auto max-w-[432px] my-2 min-w-0">
										<div
											className="flex-1 rounded-md px-3 py-2"
											style={{
												backgroundColor: "#0f1112",
												border: "1px solid #1e2124"
											}}
										>
											<div className="flex items-center justify-between text-sm text-[#E6E6E6] cursor-default">
												<div className="truncate">{s.placeholder || "Select"}</div>
												<ChevronDownIcon className="ml-2 text-[#9aa0a6]" />
											</div>

											{Array.isArray(s.options) && s.options.length ? (
												<div className="mt-2 bg-[#0e0f10] border border-[#1b1c1d] rounded p-1 text-sm text-[#9aa0a6]">
													{s.options.map((opt: any, oi: number) => {
														const renderOptEmoji = () => {
															if (!opt.emoji) return null;
															if (typeof opt.emoji === "string") return <span className="ml-2">{opt.emoji}</span>;
															const e = opt.emoji;
															if (e.id) {
																const animated = !!e.animated;
																const src = buildEmojiCdnUrl(String(e.id), animated, 96) || "";
																if (src) {
																	return <img src={src} alt={e.name || "emoji"} className="ml-2 inline w-4 h-4" />;
																}
															}
															if (opt.emoji.name) return <span className="ml-2">{opt.emoji.name}</span>;
															return null;
														};

														return (
															<div
																key={`opt-${si}-${oi}`}
																className="flex items-center justify-between px-3 py-2 hover:bg-[#121314] rounded"
															>
																<div>
																	<div className="font-medium text-white">{opt.label}</div>
																	{opt.description ? <div className="text-xs text-[#9aa0a6]">{opt.description}</div> : null}
																</div>
																{renderOptEmoji()}
															</div>
														);
													})}
												</div>
											) : null}
										</div>
									</div>
								))}
							</div>
						) : null}

						{reactions && reactions.length ? (
							<div className="mt-2 flex gap-1">
								{reactions.map((r: any, i: number) => (
									<div
										key={i}
										className="px-2 py-1 bg-[#1E1F22] border border-[#404249] rounded-full text-sm flex items-center gap-1 hover:bg-[#2C2F33] cursor-pointer"
									>
										{r.emojiUrl ? <img src={r.emojiUrl} alt={r.emoji || "emoji"} className="w-5 h-5 inline" /> : <span>{r.emoji}</span>}
										{r.count ? <span className="text-xs text-[#949BA4]">{r.count}</span> : null}
									</div>
								))}
							</div>
						) : null}
					</div>
				</article>
			)}
		</>
	);

	const _fixed = ensureKeys(_messageTree, `message-${id}`);
	return <>{React.Children.toArray(_fixed)}</>;
}
