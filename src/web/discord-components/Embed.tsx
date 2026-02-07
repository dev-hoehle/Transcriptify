import React from "react";
import Button from "./Button";
import type { ButtonProps } from "../types/ui";
import type { EmbedField, EmbedAuthor, EmbedFooter, EmbedProps } from "../types/embed";
import { formatDate } from "./utils/date";
import { parseMarkdown } from "./utils/markdown";
import { sanitizeMarkdownString } from "./messageHelpers";

export default function Embed({
	title,
	description,
	url,
	color = null,
	timestamp = null,
	author = null,
	footer = null,
	image = null,
	thumbnail = null,
	fields = [],
	buttons = [],
	version = "v1",
	resolvedUsers,
	resolvedRoles,
	resolvedChannels,
	channelGuildId,
	interaction
}: EmbedProps) {
	const [brokenImages, setBrokenImages] = React.useState<Set<string>>(new Set());

	const parseWithContext = (value: any): React.ReactNode => parseMarkdown(value, resolvedUsers, resolvedRoles, resolvedChannels, channelGuildId);

	const imageUrl = typeof image === "string" ? image : image && (image as any).url ? (image as any).url : null;
	const thumbnailUrl = typeof thumbnail === "string" ? thumbnail : thumbnail && (thumbnail as any).url ? (thumbnail as any).url : null;
	const accent = React.useMemo(() => {
		if (color === null || color === undefined) return "#2b2d31";
		const numColor = typeof color === "number" ? color : typeof color === "string" && /^\d+$/.test(color) ? Number(color) : null;
		if (numColor !== null) return `#${numColor.toString(16).padStart(6, "0")}`;
		return (color as string) || "#2b2d31";
	}, [color]);

	const embedBg = "#2b2d31";

	const formattedFooter = React.useMemo(() => {
		if (interaction?.name && interaction?.user?.username && !footer?.text) {
			return {
				text: `Requested by ${interaction.user.username}`,
				iconUrl: footer?.iconUrl
			};
		}
		return footer;
	}, [interaction, footer]);

	const handleImageError = (imgUrl: string | null | undefined) => {
		if (!imgUrl) return;
		setBrokenImages((prev) => new Set([...prev, imgUrl]));
	};

	const renderFieldName = (rawName: any): React.ReactNode => {
		const s = sanitizeMarkdownString(rawName);
		if (!s || typeof s !== "string") return parseWithContext(s);

		if (/__/.test(s)) {
			const nodes: React.ReactNode[] = [];
			const regex = /__([\s\S]+?)__/g;
			let lastIndex = 0;
			let m: RegExpExecArray | null;
			while ((m = regex.exec(s)) !== null) {
				if (m.index > lastIndex) {
					nodes.push(<React.Fragment key={`seg-${lastIndex}`}>{parseWithContext(s.slice(lastIndex, m.index))}</React.Fragment>);
				}
				nodes.push(
					<u key={`u-${m.index}`} style={{ textDecoration: "underline", textDecorationThickness: "1px" }}>
						{parseWithContext(m[1])}
					</u>
				);
				lastIndex = regex.lastIndex;
			}
			if (lastIndex < s.length) nodes.push(<React.Fragment key={`seg-${lastIndex}`}>{parseWithContext(s.slice(lastIndex))}</React.Fragment>);
			return (
				<>
					{nodes.map((n, i) => (
						<React.Fragment key={i}>{n}</React.Fragment>
					))}
				</>
			);
		}

		return parseWithContext(s);
	};

	return (
		<div className="flex w-auto max-w-[432px] my-2 min-w-0">
			<div className="w-1 rounded-l-md" style={{ backgroundColor: accent }} />

			<div className="flex-1 rounded-r-md px-4 py-3" style={{ backgroundColor: embedBg }}>
				<div className="flex items-start gap-3">
					<div className="flex-1 space-y-1.5 min-w-0">
						{author && (
							<div className="flex items-center gap-2">
								{author.iconUrl && !brokenImages.has(author.iconUrl) ? (
									<img src={author.iconUrl} alt="" className="w-5 h-5 rounded-full" onError={() => handleImageError(author.iconUrl)} />
								) : interaction?.name ? (
									<svg
										className="text-white"
										aria-hidden="true"
										role="img"
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										fill="none"
										viewBox="0 0 24 24"
									>
										<path
											fill="currentColor"
											d="M2.06 7.61c-.25.95.31 1.92 1.26 2.18l4.3 1.15c.94.25 1.91-.31 2.17-1.26l1.15-4.3c.25-.94-.31-1.91-1.26-2.17l-4.3-1.15c-.94-.25-1.91.31-2.17 1.26l-1.15 4.3ZM12.98 7.87a2 2 0 0 0 1.75 2.95H20a2 2 0 0 0 1.76-2.95l-2.63-4.83a2 2 0 0 0-3.51 0l-2.63 4.83ZM5.86 13.27a.89.89 0 0 1 1.28 0l.75.77a.9.9 0 0 0 .54.26l1.06.12c.5.06.85.52.8 1.02l-.13 1.08c-.02.2.03.42.14.6l.56.92c.27.43.14 1-.28 1.26l-.9.58a.92.92 0 0 0-.37.48l-.36 1.02a.9.9 0 0 1-1.15.57l-1-.36a.89.89 0 0 0-.6 0l-1 .36a.9.9 0 0 1-1.15-.57l-.36-1.02a.92.92 0 0 0-.37-.48l-.9-.58a.93.93 0 0 1-.28-1.26l.56-.93c.11-.17.16-.38.14-.59l-.12-1.08c-.06-.5.3-.96.8-1.02l1.05-.12a.9.9 0 0 0 .54-.26l.75-.77ZM18.52 13.71a1.1 1.1 0 0 0-2.04 0l-.46 1.24c-.19.5-.57.88-1.07 1.07l-1.24.46a1.1 1.1 0 0 0 0 2.04l1.24.46c.5.19.88.57 1.07 1.07l.46 1.24c.35.95 1.7.95 2.04 0l.46-1.24c.19-.5.57-.88 1.07-1.07l1.24-.46a1.1 1.1 0 0 0 0-2.04l-1.24-.46a1.8 1.8 0 0 1-1.07-1.07l-.46-1.24Z"
										></path>
									</svg>
								) : null}
								{author.url ? (
									<a href={author.url} className="text-sm font-semibold text-white hover:underline">
										{author.name}
									</a>
								) : (
									<span className="text-sm font-semibold text-white">{author.name}</span>
								)}
							</div>
						)}

						{title &&
							(url ? (
								<a href={url} className="text-sky-400 hover:underline font-semibold text-base block">
									{parseWithContext(sanitizeMarkdownString(title))}
								</a>
							) : (
								<div className="text-sky-400 font-semibold text-base">{parseWithContext(sanitizeMarkdownString(title))}</div>
							))}

						{description ? (
							<div className="text-[14px] leading-[20px] text-[#DBDEE1] whitespace-pre-line break-words">
								{parseWithContext(sanitizeMarkdownString(description))}
							</div>
						) : null}

						{fields.length > 0 && (
							<div className={`grid gap-x-3 gap-y-2 ${fields.some((f) => f.inline) ? "grid-cols-3" : "grid-cols-1"}`}>
								{fields.map((field, idx) => (
									<div key={idx} className={field.inline ? "col-span-1" : "col-span-3"}>
										{typeof window !== "undefined" && window.location.href.includes("localhost")
											? (() => {
													try {
														const raw = field.name;
														const sanitized = sanitizeMarkdownString(raw);
														console.debug &&
															console.debug(
																"Embed field.name raw:",
																raw,
																"chars:",
																Array.from(String(raw || "")).map((c) => c.charCodeAt(0))
															);
														console.debug &&
															console.debug(
																"Embed field.name sanitized:",
																sanitized,
																"chars:",
																Array.from(String(sanitized || "")).map((c) => c.charCodeAt(0))
															);
													} catch (e) {}
													return null;
												})()
											: null}
										<div className="text-xs font-semibold text-white mb-0.5">
											<React.Fragment key={`fieldname-${idx}`}>{renderFieldName(field.name)}</React.Fragment>
										</div>
										<div className="text-[14px] leading-[20px] text-[#DBDEE1] whitespace-pre-line break-words">
											<React.Fragment key={`fieldvalue-${idx}`}>{parseWithContext(sanitizeMarkdownString(field.value))}</React.Fragment>
										</div>
									</div>
								))}
							</div>
						)}

						{imageUrl && !brokenImages.has(imageUrl) ? (
							<div className="mt-1">
								<img
									src={imageUrl}
									alt=""
									className="rounded w-full object-cover"
									style={{ maxHeight: "320px" }}
									onError={() => handleImageError(imageUrl)}
								/>
							</div>
						) : null}

						{(formattedFooter?.iconUrl || formattedFooter?.text || timestamp) && (
							<div className="flex items-center gap-2 text-sm text-[#9ca3af]">
								{formattedFooter?.iconUrl && !brokenImages.has(formattedFooter.iconUrl) ? (
									<img
										src={formattedFooter.iconUrl}
										alt=""
										className="w-5 h-5 rounded-full"
										onError={() => handleImageError(formattedFooter.iconUrl)}
									/>
								) : null}
								<span>
									{formattedFooter?.text}
									{formattedFooter?.text && timestamp && " • "}
									{timestamp && formatDate(timestamp)}
								</span>
							</div>
						)}

						{buttons.length > 0 && version === "v2" ? (
							<div className="flex flex-wrap gap-2 pt-2">
								{buttons.map((btn, idx) => (
									<Button key={idx} {...btn} />
								))}
							</div>
						) : null}
					</div>

					{thumbnailUrl && !brokenImages.has(thumbnailUrl) ? (
						<div className="shrink-0 ml-2">
							<img src={thumbnailUrl} alt="" className="rounded w-20 h-20 object-cover" onError={() => handleImageError(thumbnailUrl)} />
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}
