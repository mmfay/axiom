"use client";

import { ButtonHTMLAttributes } from "react";
import { useAuth } from "@/app/provider/AuthProvider";

type SecureButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	permission: string;
};

export default function SecureButton({
	permission,
	disabled,
	className = "",
	children,
	...rest
}: SecureButtonProps) {
	const { hasPermission } = useAuth();
	const authorized = hasPermission(permission);
	const isDisabled = !authorized || !!disabled;

	const btn = (
		<button
			{...rest}
			disabled={isDisabled}
			className={`${className}${!authorized ? " opacity-40 cursor-not-allowed" : ""}`}
		>
			{children}
		</button>
	);

	if (!authorized) {
		return (
			<span title={`Requires ${permission}`} className="inline-flex">
				{btn}
			</span>
		);
	}

	return btn;
}
