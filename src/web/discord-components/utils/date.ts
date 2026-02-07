export function formatDate(input?: string | Date | null): string {
	if (!input) return "";
	const d = typeof input === "string" ? new Date(input) : input;
	if (!d || Number.isNaN(d.getTime())) return "";
	const day = String(d.getDate()).padStart(2, "0");
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const year = d.getFullYear();

	let hours = d.getHours();
	const minutes = String(d.getMinutes()).padStart(2, "0");
	const ampm = hours >= 12 ? "PM" : "AM";
	hours = hours % 12 || 12;
	const hourStr = String(hours).padStart(2, "0");

	return `${day}.${month}.${year} ${hourStr}:${minutes} ${ampm}`;
}

export function formatTime(input?: string | Date | null): string {
	if (!input) return "";
	const d = typeof input === "string" ? new Date(input) : input;
	if (!d || Number.isNaN(d.getTime())) return "";
	let hours = d.getHours();
	const minutes = String(d.getMinutes()).padStart(2, "0");
	const ampm = hours >= 12 ? "PM" : "AM";
	hours = hours % 12 || 12;
	const hourStr = String(hours).padStart(2, "0");

	return `${hourStr}:${minutes} ${ampm}`;
}

export function formatDateShort(input?: string | Date | null): string {
	if (!input) return "";
	const d = typeof input === "string" ? new Date(input) : input;
	if (!d || Number.isNaN(d.getTime())) return "";

	const day = String(d.getDate()).padStart(2, "0");
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const year = d.getFullYear();

	let hours = d.getHours();
	const minutes = String(d.getMinutes()).padStart(2, "0");
	const ampm = hours >= 12 ? "PM" : "AM";
	hours = hours % 12 || 12;
	const hourStr = String(hours).padStart(2, "0");

	return `${day}.${month}.${year} ${hourStr}:${minutes} ${ampm}`;
}
