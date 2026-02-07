import React from "react";
import { colorThemePreviews } from "./themeColors";
import type { ThemeSwitcherProps } from "../types/props";
import type { TranscriptThemes } from "../types/theme";

const colorThemes: Array<Exclude<TranscriptThemes, "light" | "ash" | "onyx" | "system">> = [
	"mint_apple",
	"citrus_sherbert",
	"retro_raincloud",
	"hanami",
	"sunrise",
	"cotton_candy",
	"lofi_vibes",
	"desert_khaki",
	"sunset",
	"chroma_glow",
	"forest",
	"crimson_moon",
	"midnight_blurple",
	"mars",
	"dusk",
	"under_the_sea",
	"retro_storm",
	"neon_nights",
	"strawberry_lemonade",
	"aurora",
	"sepia",
	"blurple_twilight"
];

function prettyName(s: string) {
	return s
		.replace(/_/g, " ")
		.split(" ")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

export default function ThemeSwitcher({ currentTheme, onThemeChange }: ThemeSwitcherProps) {
	const defaultThemes: Array<"light" | "ash" | "dark" | "onyx" | "system"> = ["light", "ash", "dark", "onyx", "system"];

	return (
		<div className="space-y-3">
			<div className="flex items-start justify-between">
				<div>
					<h3 className="text-lg font-semibold text-white mb-0.5">Theme</h3>
					<p className="text-xs text-[#b5bac1]">Adjust the color of the interface for better visibility.</p>
				</div>
			</div>

			<div>
				<div className="text-xs font-semibold text-[#b5bac1] uppercase mb-3">Default Themes</div>
				<div className="flex gap-4 flex-wrap">
					{defaultThemes.map((theme) => {
						const isSelected = currentTheme === theme;
						const isSystem = theme === "system";

						return (
							<button
								key={theme}
								type="button"
								onClick={() => onThemeChange(theme)}
								role="radio"
								aria-label={`Select ${theme} theme`}
								aria-checked={isSelected}
								className={
									isSelected
										? `relative group w-12 h-12 rounded-lg ring-2 ring-offset-1 ring-[#5865f2] transition-all`
										: `relative group w-12 h-12 rounded-lg border-2 transition-all border-[#4e5058] hover:border-[#6d70d8]`
								}
							>
								<div className="absolute -top-9 left-1/2 transform -translate-x-1/2 hidden group-hover:flex items-center justify-center bg-[#0b0b0c] text-white text-xs px-2 py-1 rounded-md shadow z-50 whitespace-nowrap">
									{prettyName(theme)}
								</div>
								<div className="w-full h-full rounded-md overflow-hidden">
									{isSystem ? (
										<div className="w-full h-full bg-gradient-to-br from-[#ffffff] to-[#070709] flex items-center justify-center">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#5865f2]">
												<path
													d="M12 2L2 7L12 12L22 7L12 2Z"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
												<path
													d="M2 17L12 22L22 17"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
												<path
													d="M2 12L12 17L22 12"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
										</div>
									) : (
										<div
											className="w-full h-full"
											style={{
												backgroundColor: theme === "light" ? "#ffffff" : theme === "ash" ? "#36393f" : "#070709"
											}}
										/>
									)}
								</div>
							</button>
						);
					})}
				</div>
			</div>

			<div>
				<div className="text-xs font-semibold text-[#b5bac1] uppercase mb-3">Color Themes</div>

				<div className="flex flex-wrap gap-4">
					{colorThemes.map((theme) => {
						const preview = colorThemePreviews[theme];
						const isSelected = currentTheme === theme;

						return (
							<button
								key={theme}
								type="button"
								onClick={() => onThemeChange(theme)}
								role="radio"
								aria-label={`Select ${prettyName(theme)} theme`}
								aria-checked={isSelected}
								className={
									isSelected
										? `relative group w-14 h-14 rounded-lg ring-2 ring-offset-1 ring-[#5865f2] transition-all`
										: `relative group w-14 h-14 rounded-lg border-2 transition-all border-[#4e5058] hover:border-[#6d70d8]`
								}
							>
								<div className="absolute -top-9 left-1/2 transform -translate-x-1/2 hidden group-hover:flex items-center justify-center bg-[#0b0b0c] text-white text-xs px-2 py-1 rounded-md shadow z-50 whitespace-nowrap">
									{prettyName(theme)}
								</div>
								<div className="w-full h-full rounded-md overflow-hidden">
									{preview.gradient && <div className="w-full h-full" style={{ background: preview.gradient }} />}
								</div>
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}
