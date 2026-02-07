import type React from "react";
export type { ButtonVariant, ButtonProps } from "../types/ui";
import type { ButtonVariant, ButtonProps } from "../types/ui";

const variantStyles: Record<ButtonVariant, string> = {
	primary: "bg-[#5865F2] hover:bg-[#4752C4] text-white",
	secondary: "bg-[#4E5058] hover:bg-[#6D6F78] text-white",
	success: "bg-[#3BA55D] hover:bg-[#2D7D46] text-white",
	danger: "bg-[#ED4245] hover:bg-[#C03537] text-white",
	link: "bg-transparent hover:bg-[#4E5058] text-[#00AFF4]"
};

export default function Button({ label, url, variant = "primary", disabled = false, emoji, onClick }: ButtonProps) {
	const baseStyles = "px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";
	const variantStyle = variantStyles[variant];

	const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
		if (disabled) return;
		if (onClick) {
			onClick(e);
			return;
		}
		if (url) {
			window.open(url, "_blank", "noopener,noreferrer");
		}
	};

	return (
		<button className={`${baseStyles} ${variantStyle}`} onClick={handleClick} disabled={disabled} type="button">
			{emoji && <span>{emoji}</span>}
			{label}
		</button>
	);
}
