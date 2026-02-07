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
	| "crimson"
	| "midnight_blurple"
	| "mars"
	| "dusk"
	| "under_the_sea"
	| "retro_storm"
	| "neon_nights"
	| "strawberry_lemonade"
	| "aurora"
	| "sepia";

export type TranscriptCreateOptions = {
	/**
	 * @description The maximum number of messages to include in the transcript. Set to undefined to include all messages.
	 * @default undefined
	 */
	limit?: number;
	/**
	 * @description Download all attachments and store locally in an assets directory (default "assets").
	 * @default false
	 */
	saveAssets?:
		| boolean
		| {
				/**
				 * @description Optional image compression level (1-100). Requires external image processing library.
				 * Vanilla Node.js does not support image compression/conversion.
				 * @default undefined (no compression)
				 */
				compression?: number;
				/**
				 * @description Optional assets output directory.
				 * @default "assets"
				 */
				dir?: string;
		  };
	/**
	 * @description The Filename of the generated transcript
	 * @default "transcript-{channelID}-{timestamp}.html"
	 */
	filename?: string;
	/**
	 * @description The 'PoweredBy dcTranscriptify' text at the bottom of the transcript
	 * @default true
	 */
	poweredBy?: boolean;
	/**
	 * @description Allow users to switch the theme of the transcript
	 * @default true
	 */
	allowThemeSwitching?: boolean;
	/**
	 * @description Default theme of the transcript
	 * @default dark/light based on system preference
	 */
	theme?: TranscriptThemes;
	/**
	 * @description Ignore options for the transcript generation
	 */
	ignore?: {
		/**
		 * @description Ignore messages from bot accounts when generating the transcript
		 * @default false
		 */
		bots?: boolean;
		/**
		 * @description Array of user IDs to ignore when generating the transcript. Only strings are allowed.
		 * @default []
		 */
		userIDs?: string[];
		/**
		 * @description Attachment ignore options
		 */
		attachments?: {
			/**
			 * @description Ignore image attachments (png, jpg, gif, etc.)
			 * @default false
			 */
			images?: boolean;
			/**
			 * @description Ignore video attachments (mp4, mov, etc.)
			 * @default false
			 */
			videos?: boolean;
			/**
			 * @description Ignore audio attachments (mp3, wav, etc.)
			 * @default false
			 */
			audio?: boolean;
			/**
			 * @description Ignore other file attachments (pdf, zip, etc.)
			 * @default false
			 */
			files?: boolean;
		};
		/**
		 * @description Ignore guild badges
		 * @default false
		 */
		guildBadges?: boolean;
	};
};
