export interface Interaction {
	name?: string;
	user?: InteractionUser;
}

export interface InteractionUser {
	id?: string;
	username?: string;
}
