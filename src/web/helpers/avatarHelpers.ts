import { buildAvatarCdnUrl } from "./cdnHelpers";

export function buildAvatarUrl(userId: string, avatarHash: string): string {
	if (/^https?:\/\//i.test(avatarHash) || /^\.|^\//.test(avatarHash) || /^assets\//.test(avatarHash)) {
		return avatarHash;
	}
	const url = buildAvatarCdnUrl(userId, avatarHash);
	return url || avatarHash;
}
