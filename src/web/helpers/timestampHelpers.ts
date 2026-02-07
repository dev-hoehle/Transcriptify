export function formatFullTimestamp(date: Date): string {
	return date.toLocaleString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit"
	});
}

export function formatTagDate(date: Date): string {
	return date.toLocaleString("en-US", {
		month: "2-digit",
		day: "2-digit",
		year: "2-digit",
		hour: "numeric",
		minute: "2-digit"
	});
}

export function formatShortTime(date: Date): string {
	return date.toLocaleTimeString([], {
		hour: "numeric",
		minute: "2-digit"
	});
}

export function formatShortDateTime(date: Date): string {
	return date.toLocaleString("en-US", {
		month: "2-digit",
		day: "2-digit",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit"
	});
}

export function formatTimeAgo(date: Date): string {
	const diff = Math.floor((Date.now() - date.getTime()) / 1000);
	if (Math.abs(diff) < 60) return `${Math.abs(diff)}s ago`;
	if (Math.abs(diff) < 3600) return `${Math.round(Math.abs(diff) / 60)}m ago`;
	if (Math.abs(diff) < 86400) return `${Math.round(Math.abs(diff) / 3600)}h ago`;
	return "Yesterday";
}

export function formatRelativeTimestamp(date: Date): string {
	const diff = Math.floor((Date.now() - date.getTime()) / 1000);
	if (Math.abs(diff) < 60) return `${Math.abs(diff)}s ago`;
	if (Math.abs(diff) < 3600) return `${Math.round(Math.abs(diff) / 60)}m ago`;
	if (Math.abs(diff) < 86400) return `${Math.round(Math.abs(diff) / 3600)}h ago`;
	return date.toLocaleString("en-US", {
		month: "2-digit",
		day: "2-digit",
		year: "numeric"
	});
}
