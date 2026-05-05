"use client";

import { useState, useEffect } from "react";
import { FilterField } from "../../lib/hooks/useFilterController";

type Props = {
	open: boolean;
	onClose: () => void;
	fields: FilterField[];
	current: Record<string, string>;
	onApply: (filters: Record<string, string>) => void;
	onClear: () => void;
};

export default function FilterPanel({ open, onClose, fields, current, onApply, onClear }: Props) {
	const [draft, setDraft] = useState<Record<string, string>>(current);

	useEffect(() => {
		if (open) setDraft(current);
	}, [open]);

	function set(id: string, value: string) {
		setDraft((prev) => ({ ...prev, [id]: value }));
	}

	return (
		<>
			{/* Backdrop */}
			<div
				className={`fixed top-14 inset-x-0 bottom-0 z-30 bg-black/30 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
				onClick={onClose}
			/>

			{/* Panel */}
			<div className={`fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-white/10 shadow-xl flex flex-col transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}>

				{/* Header */}
				<div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/10">
					<h2 className="text-sm font-semibold text-gray-900 dark:text-white">Filters</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
					>
						✕
					</button>
				</div>

				{/* Fields */}
				<div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
					{fields.map((field) => (
						<div key={field.id} className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
								{field.label}
							</label>

							{field.type === "text" && (
								<input
									type="text"
									value={draft[field.id] ?? ""}
									onChange={(e) => set(field.id, e.target.value)}
									placeholder={`Filter by ${field.label.toLowerCase()}…`}
									className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
								/>
							)}

							{field.type === "boolean" && (
								<select
									value={draft[field.id] ?? ""}
									onChange={(e) => set(field.id, e.target.value)}
									className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
								>
									<option value="">Any</option>
									<option value="true">Yes</option>
									<option value="false">No</option>
								</select>
							)}
						</div>
					))}
				</div>

				{/* Footer */}
				<div className="flex gap-2 px-5 py-4 border-t border-gray-200 dark:border-white/10">
					<button
						onClick={() => onApply(draft)}
						className="flex-1 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
					>
						Apply
					</button>
					<button
						onClick={onClear}
						className="px-4 py-2 text-sm border border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-md transition-colors"
					>
						Clear
					</button>
				</div>
			</div>
		</>
	);
}
