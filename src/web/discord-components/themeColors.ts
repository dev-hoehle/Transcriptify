import type { TranscriptThemes, ThemeColors, ThemePreview } from "../types/theme";

export const defaultThemeColors: Record<"light" | "ash" | "dark" | "onyx", ThemeColors> = {
	light: {
		bg: "#ffffff",
		text: "#0f172a",
		header: "#f3f4f6",
		border: "#e5e7eb",
		subtext: "#475569",
		accent: "#0f172a"
	},
	ash: {
		bg: "#36393f",
		text: "#dcddde",
		header: "#2f3136",
		border: "#202225",
		subtext: "#96989d",
		accent: "#b9bbbe"
	},
	dark: {
		bg: "#1d1d21",
		text: "#dcddde",
		header: "#19191b",
		border: "#222225",
		subtext: "#9aa0a6",
		accent: "#b9bbbe"
	},
	onyx: {
		bg: "#070709",
		text: "#ffffff",
		header: "#0d0d10",
		border: "#1b1b1f",
		subtext: "#72767D",
		accent: "#B0BEC5"
	}
};

export const colorThemeColors: Record<string, ThemeColors> = {
	mint_apple: {
		bg: "#d0f4e3",
		text: "#0a7d4f",
		header: "#b8f0d5",
		border: "#a0eccc",
		subtext: "#2d9970",
		accent: "#0a7d4f"
	},
	citrus_sherbert: {
		bg: "#fff5d6",
		text: "#9d6e0f",
		header: "#ffedb3",
		border: "#ffe699",
		subtext: "#b8850f",
		accent: "#9d6e0f"
	},
	retro_raincloud: {
		bg: "#d5e0f0",
		text: "#3a4d66",
		header: "#c5d5e8",
		border: "#b5cbdd",
		subtext: "#5a7099",
		accent: "#3a4d66"
	},
	hanami: {
		bg: "#f9e0f0",
		text: "#8a3d5f",
		header: "#f2cce6",
		border: "#ecb3db",
		subtext: "#a85a7f",
		accent: "#8a3d5f"
	},
	sunrise: {
		bg: "#ffefd1",
		text: "#a6470f",
		header: "#ffe3ad",
		border: "#ffd699",
		subtext: "#c87a40",
		accent: "#a6470f"
	},
	cotton_candy: {
		bg: "#f5e8fa",
		text: "#6a2d7f",
		header: "#e8d4f2",
		border: "#ddc0e8",
		subtext: "#8a5fa0",
		accent: "#6a2d7f"
	},
	lofi_vibes: {
		bg: "#e8d8c8",
		text: "#5a4a3a",
		header: "#dcc8b8",
		border: "#d0b8a8",
		subtext: "#7a6a5a",
		accent: "#5a4a3a"
	},
	desert_khaki: {
		bg: "#e8e0cf",
		text: "#6d5f3f",
		header: "#dcceb8",
		border: "#d0bfa0",
		subtext: "#8d7f5f",
		accent: "#6d5f3f"
	},
	sunset: {
		bg: "#3d1a2f",
		text: "#ffc8e0",
		header: "#2f0f1f",
		border: "#4d2a3f",
		subtext: "#d9a8c8",
		accent: "#ffc8e0"
	},
	chroma_glow: {
		bg: "#1f1f3f",
		text: "#f0ebff",
		header: "#17172f",
		border: "#2f2d4f",
		subtext: "#c0b8d9",
		accent: "#f0ebff"
	},
	forest: {
		bg: "#2f3e2f",
		text: "#d8f0d8",
		header: "#223022",
		border: "#3f523f",
		subtext: "#afd0af",
		accent: "#d8f0d8"
	},
	crimson_moon: {
		bg: "#330a0a",
		text: "#ffd9d9",
		header: "#2a0808",
		border: "#551515",
		subtext: "#ff9999",
		accent: "#ffd9d9"
	},
	midnight_blurple: {
		bg: "#2a2c4d",
		text: "#e8ebff",
		header: "#1e1f3a",
		border: "#3a3d5f",
		subtext: "#b0b3e0",
		accent: "#e8ebff"
	},
	mars: {
		bg: "#4d3028",
		text: "#ffd9c8",
		header: "#3a2218",
		border: "#664d3f",
		subtext: "#d9b8a8",
		accent: "#ffd9c8"
	},
	dusk: {
		bg: "#3a2e50",
		text: "#ede6ff",
		header: "#2a2240",
		border: "#4a4a66",
		subtext: "#c9b8e0",
		accent: "#ede6ff"
	},
	under_the_sea: {
		bg: "#1f4a4a",
		text: "#d0ffff",
		header: "#143030",
		border: "#2f6f6f",
		subtext: "#a0e8e8",
		accent: "#d0ffff"
	},
	retro_storm: {
		bg: "#1f2a3f",
		text: "#d0e0f0",
		header: "#162535",
		border: "#2f4d66",
		subtext: "#9fbfd9",
		accent: "#d0e0f0"
	},
	neon_nights: {
		bg: "#0f0f2a",
		text: "#e8e8ff",
		border: "#2a2a4f",
		header: "#0a0a1f",
		subtext: "#b0b0e0",
		accent: "#e8e8ff"
	},
	strawberry_lemonade: {
		bg: "#ffebf5",
		text: "#9d2a4f",
		header: "#ffe0ed",
		border: "#ffcce0",
		subtext: "#c85f7f",
		accent: "#9d2a4f"
	},
	aurora: {
		bg: "#1f3a4a",
		text: "#d0ecff",
		header: "#142a3a",
		border: "#2f6088",
		subtext: "#a0d4f0",
		accent: "#d0ecff"
	},
	sepia: {
		bg: "#f5eae0",
		text: "#5a4528",
		header: "#ead6c0",
		border: "#dcc5a8",
		subtext: "#7a6a50",
		accent: "#5a4528"
	},
	blurple_twilight: {
		bg: "#1f1a3f",
		text: "#e8ebff",
		header: "#15102a",
		border: "#3a375f",
		subtext: "#b0b3e0",
		accent: "#e8ebff"
	}
};

export function getThemeColors(theme: TranscriptThemes, systemPrefersDark: boolean): ThemeColors {
	if (theme === "system") {
		return systemPrefersDark ? defaultThemeColors.onyx : defaultThemeColors.light;
	}
	if (theme in defaultThemeColors) {
		return defaultThemeColors[theme as keyof typeof defaultThemeColors];
	}
	if (theme in colorThemeColors) {
		return colorThemeColors[theme];
	}
	return defaultThemeColors.onyx;
}

export function getThemeGradient(theme: TranscriptThemes): string | null {
	if (theme in colorThemePreviews) {
		return colorThemePreviews[theme].gradient;
	}
	return null;
}

export const defaultThemePreviews: Record<"light" | "ash" | "dark" | "onyx" | "system", ThemePreview> = {
	light: {
		primary: "#ffffff"
	},
	ash: {
		primary: "#36393f"
	},
	dark: {
		primary: "#1d1d21"
	},
	onyx: {
		primary: "#070709"
	},
	system: {
		primary: "transparent"
	}
};

export const colorThemePreviews: Record<string, { gradient: string }> = {
	mint_apple: {
		gradient: "linear-gradient(180deg, #56b69f 6.15%, #63bc61 48.7%, #9eca67 93.07%)"
	},
	citrus_sherbert: {
		gradient: "linear-gradient(180deg, #f3b336 31.1%, #ee8558 67.09%)"
	},
	retro_raincloud: {
		gradient: "linear-gradient(148.71deg, #3a7ca1 5.64%, #7f7eb9 26.38%, #7f7eb9 49.92%, #3a7ca1 73.12%)"
	},
	hanami: {
		gradient: "linear-gradient(38.08deg, #efaab3 3.56%, #efd696 35.49%, #a6daa2 68.78%)"
	},
	sunrise: {
		gradient: "linear-gradient(154.19deg, #9f4175 8.62%, #c49064 48.07%, #a6953d 76.04%)"
	},
	cotton_candy: {
		gradient: "linear-gradient(180.14deg, #f4abb8 8.5%, #b1c2fc 94.28%)"
	},
	lofi_vibes: {
		gradient: "linear-gradient(179.52deg, #a4c0f7 7.08%, #a9e4e8 34.94%, #b0e2b8 65.12%, #cfdfa2 96.23%)"
	},
	desert_khaki: {
		gradient: "linear-gradient(38.99deg, #e7dbd0 12.92%, #dfd0b2 32.92%, #e0d6a3 52.11%)"
	},
	sunset: {
		gradient: "linear-gradient(141.68deg, #48288c 27.57%, #db7f4b 71.25%)"
	},
	chroma_glow: {
		gradient: "linear-gradient(128.92deg, #0eb5bf 3.94%, #4c0ce0 26.1%, #a308a7 39.82%, #9a53ff 56.89%, #218be0 76.45%)"
	},
	forest: {
		gradient: "linear-gradient(162.27deg, #142215 11.2%, #2d4d39 29.93%, #454c32 48.64%, #5a7c58 67.85%, #a98e4b 83.54%)"
	},
	crimson_moon: {
		gradient: "linear-gradient(64.92deg, #950909 16.17%, #000000 72%)"
	},
	midnight_blurple: {
		gradient: "linear-gradient(48.17deg, #5348ca 11.21%, #140730 61.92%)"
	},
	mars: {
		gradient: "linear-gradient(170.82deg, #895240 14.61%, #8f4343 74.62%)"
	},
	dusk: {
		gradient: "linear-gradient(180deg, #665069 12.84%, #91a3d1 85.99%)"
	},
	under_the_sea: {
		gradient: "linear-gradient(179.14deg, #647962 1.91%, #588575 48.99%, #6a8482 96.35%)"
	},
	retro_storm: {
		gradient: "linear-gradient(148.71deg, #3a7ca1 5.64%, #58579a 26.38%, #58579a 49.92%, #3a7ca1 73.12%)"
	},
	neon_nights: {
		gradient: "linear-gradient(180deg, #01a89e 0%, #7d60ba 50%, #b43898 100%)"
	},
	strawberry_lemonade: {
		gradient: "linear-gradient(161.03deg, #af1a6c 18.79%, #c26b20 49.76%, #e7a525 80.72%)"
	},
	aurora: {
		gradient: "linear-gradient(239.16deg, #062053 10.39%, #191fbb 26.87%, #13929a 48.31%, #218573 64.98%, #051a81 92.5%)"
	},
	sepia: {
		gradient: "linear-gradient(69.98deg, #857664 14.14%, #5b4421 60.35%)"
	},
	blurple_twilight: {
		gradient: "linear-gradient(47.61deg, #2c3fe7 11.18%, #261d83 64.54%)"
	}
};
