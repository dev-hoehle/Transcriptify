import type { GuildTag } from "../types/entities";

class GuildTagCache {
	private cache: Map<string, GuildTag> = new Map();

	get(userId: string): GuildTag | undefined {
		return this.cache.get(userId);
	}

	set(userId: string, tag: GuildTag): void {
		this.cache.set(userId, tag);
	}

	has(userId: string): boolean {
		return this.cache.has(userId);
	}
}

class UserColorCache {
	private cache: Map<string, string | null> = new Map();

	get(key: string): string | null | undefined {
		return this.cache.get(key);
	}

	set(key: string, color: string | null): void {
		this.cache.set(key, color);
	}

	has(key: string): boolean {
		return this.cache.has(key);
	}
}

export const guildTagCache: GuildTagCache = new GuildTagCache();
export const userColorCache: UserColorCache = new UserColorCache();
