import React, { useEffect, useState } from "react";
import type { MessageProps } from "../types/message";
import type { TranscriptProps } from "../types/props";
import DateSeparator from "./DateSeperator";
import PinIcon from "./icons/PinIcon";
import Message from "./Message";
import PinnedMessagesModal from "./PinnedMessagesModal";
import ThemeSwitcher from "./ThemeSwitcher";
import { getThemeColors, getThemeGradient } from "./themeColors";
import { mapMessage } from "./transcriptHelpers";
import type { TranscriptThemes } from "../types/theme";
import { formatDate } from "./utils/date";


export default function Transcript(props: TranscriptProps) {
	const { channel = { name: "transcript" }, className = "" } = props;
	const hasSSRData: boolean = Array.isArray(props.messages) && props.messages.length > 0;

	const [resolvedUsers, setResolvedUsers] = useState<Record<string, any>>(() => (props.resolvedUsers as Record<string, any>) || {});
	const [resolvedRoles, setResolvedRoles] = useState<Record<string, any>>(() => (props.resolvedRoles as Record<string, any>) || {});
	const [resolvedChannels, setResolvedChannels] = useState<Record<string, any>>(() => (props.resolvedChannels as Record<string, any>) || {});
	const [localMessages, setLocalMessages] = useState<MessageProps[]>(() => {
		if (!hasSSRData || !props.messages) return [];
		const users = (props.resolvedUsers as Record<string, any>) || {};
		const roles = (props.resolvedRoles as Record<string, any>) || {};
		const rawMessages: any[] = props.messages as any[];
		const byOriginal = new Map<string, any>();
		const msgs = rawMessages.map((m: any) => {
			const mapped = mapMessage(m, new Map(), users, roles);
			byOriginal.set(String(m.id), mapped);
			return m;
		});
		return msgs.map((m: any) => mapMessage(m, byOriginal, users, roles));
	});
	const [pinnedMessages, setPinnedMessages] = useState<MessageProps[]>(() => {
		if (!hasSSRData || !props.messages) return [];
		const users = (props.resolvedUsers as Record<string, any>) || {};
		const roles = (props.resolvedRoles as Record<string, any>) || {};
		const rawMessages: any[] = props.messages as any[];
		const byOriginal = new Map<string, any>();
		const msgs = rawMessages.map((m: any) => {
			const mapped = mapMessage(m, new Map(), users, roles);
			byOriginal.set(String(m.id), mapped);
			return m;
		});
		const resolved = msgs.map((m: any) => mapMessage(m, byOriginal, users, roles));
		return resolved.filter((m: MessageProps) => m.pinned === true);
	});
	const [guildName, setGuildName] = useState<string>("");
	const [exportedAt, setExportedAt] = useState<string>(() => (typeof props.exportedAt === "string" ? props.exportedAt : ""));
	const [channelName, setChannelName] = useState<string>(channel.name);
	const [channelTopic, setChannelTopic] = useState<string | undefined>(channel.topic);
	const [themeChoice, setThemeChoice] = useState<TranscriptThemes>(() => props.theme ?? "onyx");
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isPinnedModalOpen, setIsPinnedModalOpen] = useState(false);

	const systemPrefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
	const colors = getThemeColors(themeChoice, systemPrefersDark);
	const themeGradient = getThemeGradient(themeChoice);

	useEffect(() => {
		if (hasSSRData) return;
		(async () => {
			const res = await fetch("export.json");
			const data = await res.json();

			const users = data.resolvedUsers || {};
			const roles = data.resolvedRoles || {};
			const channels = data.resolvedChannels || {};
			setResolvedUsers((prev) => Object.assign({}, users, prev || {}));
			setResolvedRoles((prev) => Object.assign({}, roles, prev || {}));
			setResolvedChannels((prev) => Object.assign({}, channels, prev || {}));

			const byOriginal = new Map<string, any>();
			const msgs = (data.messages || []).map((m: any) => {
				const mapped = mapMessage(m, new Map(), users, roles);
				byOriginal.set(String(m.id), mapped);
				return m;
			});

			const resolved = msgs.map((m: any) => mapMessage(m, byOriginal, users, roles));

			const pinned = resolved.filter((m: MessageProps) => m.pinned === true);

			setLocalMessages(resolved);
			setPinnedMessages(pinned);
			setGuildName(data.guild?.name || "");
			setExportedAt(data.exportedAt || new Date().toISOString());
			setChannelName(data.meta?.channelName || channel.name);
			setChannelTopic(data.meta?.channelTopic || channel.topic);
		})();
	}, [hasSSRData, channel.name, channel.topic]);

	React.useEffect(() => {
		if (!isSettingsOpen && !isPinnedModalOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setIsSettingsOpen(false);
				setIsPinnedModalOpen(false);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [isSettingsOpen, isPinnedModalOpen]);

	const handlePinnedMessageClick = (messageId: string) => {
		setIsPinnedModalOpen(false);
		const el = document.getElementById(messageId);
		if (el) {
			document.querySelectorAll(".message-highlight").forEach((e) => e.classList.remove("message-highlight"));
			el.classList.add("message-highlight");
			el.scrollIntoView({ behavior: "smooth", block: "center" });
			setTimeout(() => {
				el?.classList.remove("message-highlight");
			}, 2000);
		}
	};

	return (
		<>
			<div
				className="fixed inset-0 -z-10"
				style={{
					background: themeGradient || colors.bg,
					transition: "background 0.3s ease"
				}}
			/>
			<div
				className={`font-sans min-h-screen flex flex-col relative ${className}`}
				style={{
					color: colors.text,
					transition: "color 0.3s ease"
				}}
			>
				<div className="border-b py-3 px-6 sticky top-0 z-40 backdrop-blur-sm" style={{ backgroundColor: colors.header, borderColor: colors.border }}>
					<div className="w-full flex justify-between items-center">
						<div className="flex items-center gap-3 min-w-0">
							<div className="flex items-baseline gap-2">
								<span className="text-base" style={{ color: colors.accent }}>
									#
								</span>
								<h1 className="text-base font-semibold truncate" style={{ color: colors.text, maxWidth: "60vw" }}>
									{channelName}
								</h1>
							</div>
							{channelTopic && (
								<span className="text-base opacity-70 hidden sm:inline" style={{ color: colors.subtext }}>
									— {channelTopic}
								</span>
							)}
						</div>

						<div className="flex items-center gap-2 flex-shrink-0">
							{exportedAt && (
								<span className="text-base hidden md:inline" style={{ color: colors.subtext }}>
									Exported: {formatDate(exportedAt)}
								</span>
							)}
							<span className="text-base hidden md:inline ml-4" style={{ color: colors.subtext }}>
								Messages: {localMessages.length}
							</span>
							<button
								type="button"
								aria-label="Open pinned messages"
								className="p-1.5 sm:p-2 rounded hover:opacity-80 border transition-opacity bg-transparent"
								style={{ borderColor: colors.border, color: colors.text }}
								onClick={() => setIsPinnedModalOpen(true)}
							>
								<PinIcon width={20} height={20} />
							</button>
							{props.allowThemeSwitching !== false && (
								<button
									type="button"
									aria-label="Open settings"
									className="p-1.5 sm:p-2 rounded hover:opacity-80 border transition-opacity bg-transparent"
									style={{ borderColor: colors.border, color: colors.text }}
									onClick={() => setIsSettingsOpen(true)}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										xmlnsXlink="http://www.w3.org/1999/xlink"
										viewBox="0 0 24 24"
										width="20"
										height="20"
										preserveAspectRatio="xMidYMid meet"
									>
										<defs>
											<clipPath id="__lottie_element_97">
												<rect width="24" height="24" x="0" y="0"></rect>
											</clipPath>
											<clipPath id="__lottie_element_99">
												<path d="M0,0 L600,0 L600,600 L0,600z"></path>
											</clipPath>
										</defs>
										<g clipPath="url(#__lottie_element_97)">
											<g clipPath="url(#__lottie_element_99)" transform="matrix(0.04,0,0,0.04,0,0)" opacity="1">
												<g transform="matrix(25,0,0,25,300,300)" opacity="1">
													<g opacity="1" transform="matrix(1,0,0,1,0,0)">
														<path
															fill="currentColor"
															fillOpacity="1"
															d=" M-1.4420000314712524,-10.906000137329102 C-1.8949999809265137,-10.847000122070312 -2.1470000743865967,-10.375 -2.078000068664551,-9.92300033569336 C-1.899999976158142,-8.756999969482422 -2.265000104904175,-7.7210001945495605 -3.061000108718872,-7.390999794006348 C-3.8570001125335693,-7.060999870300293 -4.8480000495910645,-7.534999847412109 -5.546000003814697,-8.484999656677246 C-5.816999912261963,-8.852999687194824 -6.329999923706055,-9.008999824523926 -6.691999912261963,-8.730999946594238 C-7.458000183105469,-8.142999649047852 -8.142999649047852,-7.458000183105469 -8.730999946594238,-6.691999912261963 C-9.008999824523926,-6.329999923706055 -8.852999687194824,-5.816999912261963 -8.484999656677246,-5.546000003814697 C-7.534999847412109,-4.8480000495910645 -7.060999870300293,-3.8570001125335693 -7.390999794006348,-3.061000108718872 C-7.7210001945495605,-2.265000104904175 -8.756999969482422,-1.899999976158142 -9.92300033569336,-2.078000068664551 C-10.375,-2.1470000743865967 -10.847000122070312,-1.8949999809265137 -10.906000137329102,-1.4420000314712524 C-10.968000411987305,-0.9700000286102295 -11,-0.48899999260902405 -11,0 C-11,0.48899999260902405 -10.968000411987305,0.9700000286102295 -10.906000137329102,1.4420000314712524 C-10.847000122070312,1.8949999809265137 -10.375,2.1470000743865967 -9.92300033569336,2.078000068664551 C-8.756999969482422,1.899999976158142 -7.7210001945495605,2.265000104904175 -7.390999794006348,3.061000108718872 C-7.060999870300293,3.8570001125335693 -7.534999847412109,4.8470001220703125 -8.484999656677246,5.546000003814697 C-8.852999687194824,5.816999912261963 -9.008999824523926,6.328999996185303 -8.730999946594238,6.691999912261963 C-8.142999649047852,7.458000183105469 -7.458000183105469,8.142999649047852 -6.691999912261963,8.730999946594238 C-6.329999923706055,9.008999824523926 -5.816999912261963,8.852999687194824 -5.546000003814697,8.484999656677246 C-4.8480000495910645,7.534999847412109 -3.8570001125335693,7.060999870300293 -3.061000108718872,7.390999794006348 C-2.265000104904175,7.7210001945495605 -1.899999976158142,8.756999969482422 -2.078000068664551,9.92300033569336 C-2.1470000743865967,10.375 -1.8949999809265137,10.847000122070312 -1.4420000314712524,10.906000137329102 C-0.9700000286102295,10.968000411987305 -0.48899999260902405,11 0,11 C0.48899999260902405,11 0.9700000286102295,10.968000411987305 1.4420000314712524,10.906000137329102 C1.8949999809265137,10.847000122070312 2.1470000743865967,10.375 2.078000068664551,9.92300033569336 C1.899999976158142,8.756999969482422 2.2660000324249268,7.7210001945495605 3.062000036239624,7.390999794006348 C3.8580000400543213,7.060999870300293 4.8480000495910645,7.534999847412109 5.546000003814697,8.484999656677246 C5.816999912261963,8.852999687194824 6.328999996185303,9.008999824523926 6.691999912261963,8.730999946594238 C7.458000183105469,8.142999649047852 8.142999649047852,7.458000183105469 8.730999946594238,6.691999912261963 C9.008999824523926,6.328999923706055 8.852999687194824,5.816999912261963 8.484999656677246,5.546000003814697 C7.534999847412109,4.8480000495910645 7.060999870300293,3.8570001125335693 7.390999794006348,3.061000108718872 C7.7210001945495605,2.265000104904175 8.756999969482422,1.899999976158142 9.92300033569336,2.078000068664551 C10.375,2.1470000743865967 10.847000122070312,1.8949999809265137 10.906000137329102,1.4420000314712524 C10.968000411987305,0.9700000286102295 11,0.48899999260902405 11,0 C11,-0.48899999260902405 10.968000411987305,-0.9700000286102295 10.906000137329102,-1.4420000314712524 C10.847000122070312,-1.8949999809265137 10.375,-2.1470000743865967 9.92300033569336,-2.078000068664551 C8.756999969482422,-1.899999976158142 7.7210001945495605,-2.265000104904175 7.390999794006348,-3.061000108718872 C7.060999870300293,-3.8570001125335693 7.534999847412109,-4.8480000495910645 8.484999656677246,-5.546000003814697 C8.852999687194824,-5.816999912261963 9.008999824523926,-6.329999923706055 8.730999946594238,-6.691999912261963 C8.142999649047852,-7.458000183105469 7.458000183105469,-8.142999649047852 6.691999912261963,-8.730999946594238 C6.328999996185303,-9.008999824523926 5.817999839782715,-8.852999687194824 5.546999931335449,-8.484999656677246 C4.848999977111816,-7.534999847412109 3.8580000400543213,-7.060999870300293 3.062000036239624,-7.390999794006348 C2.2660000324249268,-7.7210001945495605 1.9010000228881836,-8.756999969482422 2.0789999961853027,-9.92300033569336 C2.1480000019073486,-10.375 1.8949999809265137,-10.847000122070312 1.4420000314712524,-10.906000137329102 C0.9700000286102295,-10.968000411987305 0.48899999260902405,-11 0,-11 C-0.48899999260902405,-11 -0.9700000286102295,-10.968000411987305 -1.4420000314712524,-10.906000137329102z M4,0 C4,2.2090001106262207 2.2090001106262207,4 0,4 C-2.2090001106262207,4 -4,2.2090001106262207 -4,0 C-4,-2.2090001106262207 -2.2090001106262207,-4 0,-4 C2.2090001106262207,-4 4,-2.2090001106262207 4,0z"
														/>
													</g>
												</g>
											</g>
										</g>
									</svg>
								</button>
							)}
						</div>
					</div>
				</div>

				<div className="w-full py-8 px-4 sm:px-6 flex flex-col items-start gap-0 flex-1">
					{localMessages.length === 0 ? (
						<div className="text-center text-[#72767D] py-8">No messages</div>
					) : (
						localMessages.map((msg, idx, arr) => {
							const prevMsg = idx > 0 ? arr[idx - 1] : null;
							const showDateSeparator =
								idx === 0 || (prevMsg && new Date(prevMsg.timestamp || 0).toDateString() !== new Date(msg.timestamp || 0).toDateString());

							const shouldGroup =
								!showDateSeparator &&
								prevMsg &&
								prevMsg.author.id === msg.author.id &&
								!msg.replyTo &&
								!prevMsg.replyTo &&
								msg.messageType !== 7 &&
								prevMsg.messageType !== 7 &&
								prevMsg.timestamp &&
								msg.timestamp &&
								new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() <= 300000;

							return (
								<React.Fragment key={msg.id}>
									{showDateSeparator && <DateSeparator date={msg.timestamp || ""} />}
									<Message
										{...msg}
										compact={!!(shouldGroup as boolean)}
										resolvedUsers={resolvedUsers}
										resolvedRoles={resolvedRoles}
										resolvedChannels={resolvedChannels}
										onPinIconClick={() => setIsPinnedModalOpen(true)}
										onNavigateToMessage={handlePinnedMessageClick}
										referencedMessage={
											msg.messageType === 6
												? pinnedMessages.find((m) => String(m.id) === String((msg as any).referencedMessageId))
												: undefined
										}
									/>
								</React.Fragment>
							);
						})
					)}
				</div>

				{isSettingsOpen && props.allowThemeSwitching !== false && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsSettingsOpen(false)}>
						<div
							onClick={(e) => e.stopPropagation()}
							className="bg-[#2b2d31] text-white rounded-lg shadow-xl p-4 w-full max-w-xl border border-[#1f1f23]"
						>
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-bold">Settings</h2>
								<button
									type="button"
									aria-label="Close settings"
									className="p-1.5 hover:bg-[#3d4148] rounded transition-colors"
									onClick={() => setIsSettingsOpen(false)}
								>
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<line x1="18" y1="6" x2="6" y2="18" />
										<line x1="6" y1="6" x2="18" y2="18" />
									</svg>
								</button>
							</div>
							<ThemeSwitcher currentTheme={themeChoice} onThemeChange={setThemeChoice} />
						</div>
					</div>
				)}

				{isPinnedModalOpen && (
					<PinnedMessagesModal
						pinnedMessages={pinnedMessages}
						onClose={() => setIsPinnedModalOpen(false)}
						onMessageClick={handlePinnedMessageClick}
					/>
				)}
				{props.poweredBy && (
					<div
						className="w-full py-3 px-6 text-center text-xs opacity-90"
						style={{
							color: colors.subtext,
							backgroundColor: colors.header,
							borderTop: `1px solid ${colors.border}`
						}}
					>
						Powered by Transcriptify
					</div>
				)}
			</div>
		</>
	);
}
