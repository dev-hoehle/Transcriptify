export type TranscriptThemes =
	| "light"
	| "ash"
	| "dark"
	| "onyx"
	| "system"
	| "mint_apple"
	| "citrus_sherbert"
	| "retro_raincloud"
	| "hanami"
	| "sunrise"
	| "cotton_candy"
	| "lofi_vibes"
	| "desert_khaki"
	| "sunset"
	| "chroma_glow"
	| "forest"
	| "crimson_moon"
	| "midnight_blurple"
	| "mars"
	| "dusk"
	| "under_the_sea"
	| "retro_storm"
	| "neon_nights"
	| "strawberry_lemonade"
	| "aurora"
	| "sepia"
	| "blurple_twilight";

export interface ThemeColors {
	bg: string;
	text: string;
	header: string;
	border: string;
	subtext: string;
	accent: string;
}

export interface ThemePreview {
	primary: string;
	secondary?: string;
	gradient?: boolean;
}
