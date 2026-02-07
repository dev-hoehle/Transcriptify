export default function DateSeparator({ date }: { date: string }) {
	let display = date;
	try {
		const d = new Date(date);
		if (!isNaN(d.getTime())) {
			display = d.toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric"
			});
		}
	} catch (e) {}

	return (
		<div className="w-full flex items-center my-4">
			<hr className="flex-1 border-t border-[#29292d]" />
			<span className="mx-4 text-sm text-[#72767D] text-center flex-none">{display}</span>
			<hr className="flex-1 border-t border-[#29292d]" />
		</div>
	);
}
