"use client";

import { useState, useEffect } from "react";

interface Props {
	message: string;
	onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: Props) {

	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const id = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(id);
	}, []);

	return (
		<div
			className={`fixed top-14 left-0 right-0 z-40 transition-all duration-300 ease-out ${
				visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
			}`}
		>
			<div className="flex items-center gap-3 px-6 py-2 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-800/40 shadow-sm">
				<svg className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
				</svg>

				<span className="flex-1 text-sm text-red-700 dark:text-red-300 truncate">{message}</span>

				<button
					onClick={onDismiss}
					title="Dismiss"
					className="shrink-0 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-300 transition-colors"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	);
}
