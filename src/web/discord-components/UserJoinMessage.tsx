import React from "react";

const JOIN_MESSAGES = [
	"[username] just joined the server - glhf!",
	"[username] just joined. Everyone, look busy!",
	"[username] just joined. Can I get a heal?",
	"[username] joined your party.",
	"[username] joined. You must construct additional pylons.",
	"Ermagherd. [username] is here.",
	"Welcome, [username]. Stay awhile and listen.",
	"Welcome, [username]. We were expecting you ( ͡° ͜ʖ ͡°)",
	"Welcome, [username]. We hope you brought pizza.",
	"Welcome [username]. Leave your weapons by the door.",
	"A wild [username] appeared.",
	"Swoooosh. [username] just landed.",
	"Brace yourselves. [username] just joined the server.",
	"[username] just joined. Hide your bananas.",
	"[username] just arrived. Seems OP – please nerf.",
	"[username] just slid into the server.",
	"A [username] has spawned in the server.",
	"Big [username] showed up!",
	"Where's [username]? In the server!",
	"[username] hopped into the server. Kangaroo!!",
	"[username] just showed up. Hold my beer"
];

export default function UserJoinMessage({ username }: { username: string }) {
	const messageIndex = username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % JOIN_MESSAGES.length;
	const template = JOIN_MESSAGES[messageIndex];
	const parts = template.split("[username]");

	return (
		<div className="flex items-center gap-2 py-1 px-4 text-sm">
			<svg height="18" width="18" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
				<g fill="none" fillRule="evenodd">
					<path d="m18 0h-18v18h18z" />
					<path d="m0 8h14.2l-3.6-3.6 1.4-1.4 6 6-6 6-1.4-1.4 3.6-3.6h-14.2" fill="#3ba55c" />
				</g>
			</svg>

			<span className="text-[#949ba4]">
				{parts[0]}
				<span className="text-white font-medium hover:underline cursor-pointer">{username}</span>
				{parts[1]}
			</span>
		</div>
	);
}
