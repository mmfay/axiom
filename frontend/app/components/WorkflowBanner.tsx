"use client";

import { useState, useEffect } from "react";

interface WorkflowStep {
	id: string;
	label: string;
}

interface Props {
	recordId?: string;
	steps?: WorkflowStep[];
	onStepSelect?: (step: WorkflowStep) => void;
	onHistory?: () => void;
	onDismiss: () => void;
}

export default function WorkflowBanner({ recordId, steps = [], onStepSelect, onHistory, onDismiss }: Props) {

	const [visible, setVisible] = useState(false);
	const [open, setOpen] = useState(false);

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
			<div className="flex items-center gap-3 px-6 py-2 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-800/40 shadow-sm">
				<svg className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
				</svg>

				<span className="flex-1 text-sm text-blue-700 dark:text-blue-300">Next workflow step</span>

				<div className="relative shrink-0">
					<button
						onClick={() => setOpen((o) => !o)}
						className="flex items-center gap-1 text-sm text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
					>
						Select step
						<svg
							className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
						</svg>
					</button>

					{open && (
						<div className="absolute right-0 mt-1 w-48 bg-white dark:bg-neutral-900 border border-blue-200 dark:border-blue-800/40 rounded shadow-md z-50">
							{steps.length === 0 ? (
								<div className="px-4 py-2 text-sm text-neutral-400 dark:text-neutral-500">No steps available</div>
							) : (
								steps.map((step) => (
									<button
										key={step.id}
										onClick={() => {
											onStepSelect?.(step);
											setOpen(false);
										}}
										className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
									>
										{step.label}
									</button>
								))
							)}
						</div>
					)}
				</div>

				{onHistory && (
					<button
						onClick={onHistory}
						title="View history"
						className="shrink-0 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 transition-colors text-xs underline underline-offset-2"
					>
						History
					</button>
				)}

				<button
					onClick={onDismiss}
					title="Dismiss"
					className="shrink-0 text-blue-400 dark:text-blue-500 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	);
}