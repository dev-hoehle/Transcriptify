export function scrollToMessage(targetId: string): void {
	const idStr = String(targetId);
	let el = document.getElementById(idStr);
	if (!el) {
		el = document.querySelector(`[data-message-id="${idStr}"]`) as HTMLElement | null;
	}
	if (el) {
		el.scrollIntoView({ behavior: "smooth", block: "center" });
	}
}

export function scrollToMessageWithHighlight(targetId: string): void {
	const idStr = String(targetId);
	let el = document.getElementById(idStr);
	if (!el) {
		el = document.querySelector(`[data-message-id="${idStr}"]`) as HTMLElement | null;
	}
	if (el) {
		document.querySelectorAll(".message-highlight").forEach((e) => {
			e.classList.remove("message-highlight");
		});
		el.classList.add("message-highlight");
		el.scrollIntoView({ behavior: "smooth", block: "center" });
		setTimeout(() => {
			el?.classList.remove("message-highlight");
		}, 2000);
	}
}
