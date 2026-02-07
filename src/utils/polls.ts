export function extractPoll(message: any): any {
	try {
		const nativePoll: any = (message as any).poll ?? null;
		if (nativePoll) {
			const answersArray: any[] = Array.isArray(nativePoll.answers)
				? nativePoll.answers
				: Array.from(typeof nativePoll.answers?.values === "function" ? nativePoll.answers.values() : (nativePoll.answers ?? []));

			const options: any[] = answersArray.map((a: any): any => {
				const label = a.text ?? a.name ?? a.label ?? null;
				const count =
					typeof a.voteCount === "number" ? a.voteCount : typeof a.votes === "number" ? a.votes : typeof a.count === "number" ? a.count : null;
				return { id: a.id ?? null, label, count };
			});

			const total = options.reduce((sum: number, o: any) => sum + (o.count || 0), 0);
			return {
				type: "native",
				question: nativePoll.question?.text ?? null,
				options,
				totalVotes: total || null,
				endsAt: nativePoll.expiresTimestamp ? new Date(nativePoll.expiresTimestamp).toISOString() : null,
				allowMultiselect: !!nativePoll.allowMultiselect
			};
		}

		return null;
	} catch {
		return null;
	}
}

export async function enrichPollVoters(message: any, poll: any): Promise<void> {
	if (!poll || poll.type !== "native") return;

	try {
		const nativePoll: any = (message as any).poll;
		if (!nativePoll || !nativePoll.answers) return;

		const answersArray: any[] = Array.isArray(nativePoll.answers)
			? nativePoll.answers
			: Array.from(typeof nativePoll.answers?.values === "function" ? nativePoll.answers.values() : nativePoll.answers);

		for (const ans of answersArray) {
			let voterIds: string[] | null = null;
			try {
				if (ans.voters) {
					if (Array.isArray(ans.voters)) {
						voterIds = ans.voters.map((u: any) => u.id ?? u).filter(Boolean);
					} else if (typeof ans.voters.values === "function") {
						voterIds = Array.from(ans.voters.values())
							.map((u: any) => u?.id ?? u)
							.filter(Boolean);
					} else if (ans.voters.cache && typeof ans.voters.cache.values === "function") {
						voterIds = Array.from(ans.voters.cache.values())
							.map((u: any) => u?.id ?? u)
							.filter(Boolean);
					}
				}
			} catch {
				voterIds = null;
			}

			const matchIndex: number = poll.options.findIndex((o: any) => {
				if (o.id && ans.id) return o.id === ans.id;
				return o.label && o.label === (ans.text ?? ans.name ?? ans.label ?? null);
			});

			if (matchIndex !== -1) {
				if (voterIds && voterIds.length) {
					poll.options[matchIndex].voters = voterIds;
					poll.options[matchIndex].count = voterIds.length;
				} else {
					const cnt: number | null =
						typeof ans.voteCount === "number"
							? ans.voteCount
							: typeof ans.votes === "number"
								? ans.votes
								: typeof ans.count === "number"
									? ans.count
									: null;
					if (cnt !== null) poll.options[matchIndex].count = cnt;
				}
			}
		}

		poll.totalVotes = poll.options.reduce((sum: number, o: any) => sum + (o.count || 0), 0);
	} catch {}
}
