import type React from "react";

export type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "link";

export interface ButtonProps {
	label: string;
	url?: string;
	variant?: ButtonVariant;
	disabled?: boolean;
	emoji?: string;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
}
