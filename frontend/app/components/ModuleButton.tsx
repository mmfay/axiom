"use client";

import Link from "next/link";
import { useAuth } from "@/app/provider/AuthProvider";

const colorMap = {
	indigo: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
	violet: "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400",
	emerald: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
	amber: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
	rose: "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400",
	cyan: "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400",
	sky: "bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400",
} as const;

type Color = keyof typeof colorMap;

type ModuleButtonProps = {
	label: string;
	description?: string;
	permission: string;
	color?: Color;
	icon?: React.ReactNode;
} & (
	| { variant: "page"; href: string }
);

export default function ModuleButton(props: ModuleButtonProps) {

	const { hasPermission } = useAuth();

	// pass the required permission to check if front end should make it visible
	if (!hasPermission(props.permission)) return null;

	const iconColor = colorMap[props.color ?? "indigo"];

	if (props.variant === "page") {

		return (
			<Link
				href={props.href}
				className="group flex items-center gap-4 w-64 px-4 py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-sm dark:hover:bg-white/[0.07] transition-all"
			>
				{props.icon && (
					<div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${iconColor}`}>
						{props.icon}
					</div>
				)}
				<div className="flex-1 min-w-0">
					<p className="text-sm font-semibold text-gray-900 dark:text-white">{props.label}</p>
					{props.description && (
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{props.description}</p>
					)}
				</div>
				<svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
				</svg>
			</Link>
		);
	}
	
}
