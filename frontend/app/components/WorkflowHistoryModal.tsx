"use client";

import { WorkflowHistoryStep } from "@/app/lib/types/workflow";

interface Props {
	steps: WorkflowHistoryStep[];
	loading: boolean;
	onClose: () => void;
}

function formatDate(iso: string) {
	return new Date(iso).toLocaleString(undefined, {
		month: "short", day: "numeric", year: "numeric",
		hour: "numeric", minute: "2-digit",
	});
}

function StatusIcon({ status }: { status: WorkflowHistoryStep["status"] }) {
	if (status === "approved")
		return (
			<span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/10">
				<svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
				</svg>
			</span>
		);
	if (status === "rejected")
		return (
			<span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-500/10">
				<svg className="w-3.5 h-3.5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
				</svg>
			</span>
		);
	return (
		<span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10">
			<svg className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		</span>
	);
}

export default function WorkflowHistoryModal({ steps, loading, onClose }: Props) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />
			<div className="relative w-full max-w-md mx-4 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-gray-200 dark:border-white/10">

				<div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/10">
					<h2 className="text-sm font-semibold text-gray-900 dark:text-white">Workflow History</h2>
					<button
						onClick={onClose}
						className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div className="px-5 py-4">
					{loading ? (
						<p className="text-sm text-gray-400 dark:text-slate-500 py-4 text-center">Loading&hellip;</p>
					) : steps.length === 0 ? (
						<p className="text-sm text-gray-400 dark:text-slate-500 py-4 text-center">No history yet.</p>
					) : (
						<ol className="flex flex-col gap-4">
							{steps.map((step, i) => (
								<li key={i} className="flex items-start gap-3">
									<StatusIcon status={step.status} />
									<div className="flex flex-col gap-0.5">
										<span className="text-sm font-medium text-gray-900 dark:text-white">{step.label}</span>
										{step.status === "pending" ? (
											<span className="text-xs text-gray-400 dark:text-slate-500">Awaiting approval</span>
										) : (
											<span className="text-xs text-gray-500 dark:text-slate-400">
												{step.status === "approved" ? "Approved" : "Rejected"} by {step.actioned_by}
												{step.actioned_at && <> &middot; {formatDate(step.actioned_at)}</>}
											</span>
										)}
									</div>
								</li>
							))}
						</ol>
					)}
				</div>

			</div>
		</div>
	);
}
