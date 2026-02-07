import { hydrateRoot } from "react-dom/client";
import Transcript from "./discord-components/Transcript";

declare global {
	interface Window {
		__TRANSCRIPT_DATA__: {
			channel: any;
			messages: any[];
			theme: string;
			resolvedUsers: Record<string, unknown>;
			resolvedRoles: Record<string, unknown>;
			resolvedChannels?: Record<string, { name?: string | null; guildId?: string | null }>;
			exportedAt: string;
			allowThemeSwitching?: boolean;
			allowThemeSwitchingPersist?: boolean;
			poweredBy?: boolean;
		};
	}
}

const data = window.__TRANSCRIPT_DATA__ ?? {
	channel: null,
	messages: [],
	theme: "",
	resolvedUsers: {},
	resolvedRoles: {},
	resolvedChannels: {},
	exportedAt: "",
	allowThemeSwitching: true,
	allowThemeSwitchingPersist: true,
	poweredBy: true
};

hydrateRoot(
	document.getElementById("root")!,
	<Transcript
		channel={data.channel}
		messages={data.messages}
		theme={data.theme as any}
		allowThemeSwitching={typeof data.allowThemeSwitching === "boolean" ? data.allowThemeSwitching : true}
		allowThemeSwitchingPersist={typeof data.allowThemeSwitchingPersist === "boolean" ? data.allowThemeSwitchingPersist : true}
		poweredBy={data.poweredBy}
		resolvedUsers={data.resolvedUsers}
		resolvedRoles={data.resolvedRoles}
		resolvedChannels={data.resolvedChannels}
		exportedAt={data.exportedAt}
		className="transcript-ssr"
	/>
);
