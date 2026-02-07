export interface Poll {
	question?: string;
	options?: PollOption[];
	totalVotes?: number;
	closed?: boolean;
	endsAt?: string;
}

export interface PollOption {
	label: string;
	count?: number;
}
