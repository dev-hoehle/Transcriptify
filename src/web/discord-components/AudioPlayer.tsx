import React from "react";
import FileAudioIcon from "./icons/FileAudioIcon";

const audioCache = new Map<string, HTMLAudioElement>();

export default function AudioPlayer({ url, filename, filesize }: { url: string; filename: string; filesize: string }) {
	const audioRef = React.useRef<HTMLAudioElement | null>(null);
	const [isPlaying, setIsPlaying] = React.useState(false);
	const [currentTime, setCurrentTime] = React.useState(0);
	const [duration, setDuration] = React.useState(0);
	const [isMuted, setIsMuted] = React.useState(false);
	const [volume, setVolume] = React.useState(1);
	const volTrackRef = React.useRef<HTMLDivElement | null>(null);
	const draggingRef = React.useRef(false);
	const [showVolPopover, setShowVolPopover] = React.useState(false);
	const hideTimeoutRef = React.useRef<number | null>(null);
	const popoverContainerRef = React.useRef<HTMLDivElement | null>(null);
	const popoverRef = React.useRef<HTMLDivElement | null>(null);

	const cancelHide = () => {
		if (hideTimeoutRef.current !== null) {
			window.clearTimeout(hideTimeoutRef.current);
			hideTimeoutRef.current = null;
		}
	};
	const scheduleHide = (ms = 260) => {
		cancelHide();
		hideTimeoutRef.current = window.setTimeout(() => {
			hideTimeoutRef.current = null;
			setShowVolPopover(false);
		}, ms) as unknown as number;
	};

	React.useEffect(() => {
		return () => {
			cancelHide();
		};
	}, []);

	React.useEffect(() => {
		if (!showVolPopover) return;
		const onMove = (e: MouseEvent) => {
			const el = popoverContainerRef.current;
			const pop = popoverRef.current;
			if (!el && !pop) return;

			let left = Infinity,
				top = Infinity,
				right = -Infinity,
				bottom = -Infinity;
			const addRect = (r: DOMRect | null) => {
				if (!r) return;
				left = Math.min(left, r.left);
				top = Math.min(top, r.top);
				right = Math.max(right, r.right);
				bottom = Math.max(bottom, r.bottom);
			};
			addRect(el ? el.getBoundingClientRect() : null);
			addRect(pop ? pop.getBoundingClientRect() : null);

			const expand = 20;
			const inside = e.clientX >= left - expand && e.clientX <= right + expand && e.clientY >= top - expand && e.clientY <= bottom + expand;
			if (inside) {
				cancelHide();
			} else {
				scheduleHide(400);
			}
		};
		window.addEventListener("mousemove", onMove);
		return () => window.removeEventListener("mousemove", onMove);
	}, [showVolPopover]);

	const handleVolPointer = (clientY: number) => {
		const el = volTrackRef.current;
		if (!el || !audioRef.current) return;
		const rect = el.getBoundingClientRect();
		const y = clientY - rect.top;
		const pct = 1 - y / rect.height;
		const v = Math.max(0, Math.min(1, pct));
		audioRef.current.volume = v;
		audioRef.current.muted = v === 0;
		setVolume(v);
		setIsMuted(v === 0);
	};

	const onGlobalMouseMove = (e: MouseEvent) => {
		if (!draggingRef.current) return;
		handleVolPointer(e.clientY);
	};
	const onGlobalMouseUp = () => {
		draggingRef.current = false;
		window.removeEventListener("mousemove", onGlobalMouseMove);
		window.removeEventListener("mouseup", onGlobalMouseUp);
	};

	const startDrag = (ev: MouseEvent) => {
		draggingRef.current = true;
		handleVolPointer(ev.clientY);
		window.addEventListener("mousemove", onGlobalMouseMove);
		window.addEventListener("mouseup", onGlobalMouseUp);
	};

	const startTouchDrag = (touch: any) => {
		draggingRef.current = true;
		handleVolPointer(touch.clientY);
		const onTouchMove = (e: TouchEvent) => handleVolPointer(e.touches[0].clientY);
		const onTouchEnd = () => {
			draggingRef.current = false;
			window.removeEventListener("touchmove", onTouchMove);
			window.removeEventListener("touchend", onTouchEnd);
		};
		window.addEventListener("touchmove", onTouchMove);
		window.addEventListener("touchend", onTouchEnd);
	};

	const formatTime = (seconds: number) => {
		if (!isFinite(seconds)) return "0:00";
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const togglePlay = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play().catch((err) => {
					console.error("Playback failed:", err);
					setIsPlaying(false);
				});
			}
		}
	};

	const handlePlay = () => setIsPlaying(true);
	const handlePause = () => setIsPlaying(false);
	const handleTimeUpdate = () => {
		if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
	};
	const handleLoadedMetadata = () => {
		if (audioRef.current) setDuration(audioRef.current.duration);
	};
	const handleEnded = () => setIsPlaying(false);

	React.useEffect(() => {
		let a = audioCache.get(url);
		if (!a) {
			a = new Audio(url);
			audioCache.set(url, a);
		}
		audioRef.current = a;

		setVolume(a.volume);
		setIsMuted(a.muted);
		setIsPlaying(!a.paused);
		if (isFinite(a.duration) && a.duration > 0) setDuration(a.duration);
		setCurrentTime(a.currentTime);

		a.addEventListener("timeupdate", handleTimeUpdate);
		a.addEventListener("loadedmetadata", handleLoadedMetadata);
		a.addEventListener("ended", handleEnded);
		a.addEventListener("play", handlePlay);
		a.addEventListener("pause", handlePause);
		const handleVolumeChangeEvent = () => {
			if (audioRef.current) {
				setVolume(audioRef.current.volume);
				setIsMuted(audioRef.current.muted);
			}
		};
		a.addEventListener("volumechange", handleVolumeChangeEvent);

		return () => {
			a.removeEventListener("timeupdate", handleTimeUpdate);
			a.removeEventListener("loadedmetadata", handleLoadedMetadata);
			a.removeEventListener("ended", handleEnded);
			a.removeEventListener("play", handlePlay);
			a.removeEventListener("pause", handlePause);
			a.removeEventListener("volumechange", handleVolumeChangeEvent);
			audioRef.current = null;
		};
	}, [url]);

	const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newTime = parseFloat(e.target.value);
		if (audioRef.current) {
			audioRef.current.currentTime = newTime;
			setCurrentTime(newTime);
		}
	};

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (audioRef.current) {
	 		audioRef.current.volume = parseFloat(e.target.value);
	 	}
	};

	void handleVolumeChange;

	return (
		<div className="w-full max-w-[520px] bg-[#1e1f22] border border-[#111214] rounded-lg p-4">
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2 flex-1 min-w-0">
					<FileAudioIcon className="h-10 w-8 flex-shrink-0" />
					<div className="min-w-0">
						<a href={url} download className="text-[15px] font-medium text-[#00a8fc] truncate hover:underline block">
							{filename}
						</a>
						<div className="text-xs text-[#b5bac1]">{filesize}</div>
					</div>
				</div>
				<a href={url} download className="ml-2 p-1 hover:bg-[#23252b] rounded transition-colors flex-shrink-0" title="Download">
					<svg width="20" height="20" viewBox="0 0 24 24">
						<path
							fill="#b5bac1"
							d="M12 2a1 1 0 0 1 1 1v10.59l3.3-3.3a1 1 0 1 1 1.4 1.42l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 1 1 1.4-1.42l3.3 3.3V3a1 1 0 0 1 1-1ZM3 20a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2H3Z"
						/>
					</svg>
				</a>
			</div>

			<div className="flex items-center gap-2">
				<button onClick={togglePlay} className="p-2 hover:bg-[#23252b] rounded transition-colors flex-shrink-0" title={isPlaying ? "Pause" : "Play"}>
					{isPlaying ? (
						<svg
							className="controlIcon_cf09d8"
							aria-hidden="true"
							role="img"
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								fill="currentColor"
								d="M6 4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H6ZM15 4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3Z"
								className=""
							/>
						</svg>
					) : (
						<svg
							className="controlIcon_cf09d8"
							aria-hidden="true"
							role="img"
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								fill="currentColor"
								d="M9.25 3.35C7.87 2.45 6 3.38 6 4.96v14.08c0 1.58 1.87 2.5 3.25 1.61l10.85-7.04a1.9 1.9 0 0 0 0-3.22L9.25 3.35Z"
								className=""
							/>
						</svg>
					)}
				</button>

				<span className="text-xs text-[#b5bac1] min-w-[60px]">
					{formatTime(currentTime)} / {formatTime(duration)}
				</span>

				<div className="flex-1 relative h-3">
					<div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-1 bg-[#23252b] rounded" />
					<div
						className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-[#7c5cff] rounded pointer-events-none"
						style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
					/>

					<input
						type="range"
						min={0}
						max={duration || 0}
						value={currentTime}
						onChange={handleSliderChange}
						className="absolute left-0 top-0 w-full h-3 bg-transparent appearance-none cursor-pointer"
					/>
				</div>

				<div
					ref={(el) => {
						popoverContainerRef.current = el;
					}}
					className="relative flex-shrink-0"
					onMouseEnter={() => {
						cancelHide();
						setShowVolPopover(true);
					}}
					onMouseLeave={() => {
						scheduleHide(260);
					}}
				>
					<button
						onClick={() => {
							if (audioRef.current) {
								const next = !audioRef.current.muted;
								audioRef.current.muted = next;
								setIsMuted(next);
							}
						}}
						className="w-8 h-8 p-1 hover:bg-[#23252b] rounded transition-colors flex items-center justify-center"
						title="Toggle mute"
					>
						{isMuted ? (
							<svg
								className="volumeButtonIcon_a8e786"
								aria-hidden="true"
								role="img"
								xmlns="http://www.w3.org/2000/svg"
								width="100%"
								height="100%"
								fill="none"
								viewBox="0 0 24 24"
							>
								<path
									fill="currentColor"
									d="M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.92l4.28 4.68a1 1 0 0 0 .74.32H11a1 1 0 0 0 1-1V3ZM22.7 8.3a1 1 0 0 0-1.4 0L19 10.58l-2.3-2.3a1 1 0 1 0-1.4 1.42L17.58 12l-2.3 2.3a1 1 0 0 0 1.42 1.4L19 13.42l2.3 2.3a1 1 0 0 0 1.4-1.42L20.42 12l2.3-2.3a1 1 0 0 0 0-1.4Z"
									className=""
								/>
							</svg>
						) : (
							<svg width="100%" height="100%" viewBox="0 0 24 24" fill="#b5bac1">
								<path d="M5 9v6h4l5 5V4L9 9H5z" />
							</svg>
						)}
					</button>
					<div
						ref={(el) => {
							popoverRef.current = el;
						}}
						className={`absolute left-1/2 bottom-full volume-popover transition-opacity flex flex-col items-center z-50`}
						style={{
							transform: "translate(-50%, -2px)",
							width: 14,
							padding: 2,
							opacity: showVolPopover ? 1 : 0,
							pointerEvents: showVolPopover ? "auto" : "none"
						}}
					>
						<div
							ref={(el) => {
								volTrackRef.current = el;
							}}
							onClick={(e) => handleVolPointer((e as React.MouseEvent).clientY)}
							onMouseDown={(e) => {
								cancelHide();
								startDrag(e.nativeEvent);
							}}
							onTouchStart={(e) => {
								cancelHide();
								startTouchDrag(e.touches[0]);
							}}
							className="relative h-28 overflow-visible cursor-pointer flex items-end justify-center"
							title="Volume"
							style={{ width: 10 }}
						>
							<div
								style={{
									position: "absolute",
									left: "50%",
									transform: "translateX(-50%)",
									bottom: 0,
									width: 6,
									borderRadius: 6,
									background: "#7c5cff",
									height: `${volume * 100}%`
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
