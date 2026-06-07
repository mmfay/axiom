"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHandler from "@/app/components/Tables/PageHandler";
import FilterPanel from "@/app/components/Filters/FilterPanel";
import { FILTER_FIELDS_GL_JOURNALS } from "@/app/lib/staticData";
import { useGLJournalController } from "@/app/lib/hooks/useGLJournalController";
import { useFilterController } from "@/app/lib/hooks/useFilterController";

const STATUS_STYLES: Record<string, string> = {
	draft:  "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
	posted: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
	voided: "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-slate-400",
};

export default function JournalsPage() {

	const filter = useFilterController(FILTER_FIELDS_GL_JOURNALS);
	const gljc = useGLJournalController();

	const [error, setError] = useState<string | null>(null);

	function handleApply(next: Record<string, string>) {
		filter.onApply(next);
		gljc.setItemFiltersState({
			base_fields: Object.entries(next)
				.filter(([, v]) => v)
				.map(([field_id, filter_value]) => ({ field_id, filter_value })),
		});
	}

	function handleClear() {
		filter.onClear();
		gljc.clearFilters();
	}

	return (
		<div className="p-8 flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold text-gray-900 dark:text-white">Journal Entries</h1>
				<div className="flex items-center gap-2">
					<button
						onClick={filter.onOpen}
						className="relative px-4 py-2 text-sm border border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-md transition-colors"
					>
						Filter
						{filter.activeCount > 0 && (
							<span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-semibold">
								{filter.activeCount}
							</span>
						)}
					</button>
					<Link
						href="/gl/journals/new"
						className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
					>
						Create
					</Link>
				</div>
			</div>
			<FilterPanel
				open={filter.open}
				onClose={filter.onClose}
				fields={filter.fields}
				current={filter.filters}
				onApply={handleApply}
				onClear={handleClear}
			/>
			<PageHandler
				pageLength={gljc.journals.length}
				prevOnClick={gljc.prevPage}
				showPrev={gljc.showPrev}
				nextOnClick={gljc.nextPage}
				showNext={gljc.showNext}
				loading={gljc.loading}
				pageNumber={gljc.pageNumber}
			/>

			{error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

			<div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
				<table className="w-full text-sm text-left">
					<thead className="text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
						<tr>
							<th className="px-4 py-3 w-28">Date</th>
							<th className="px-4 py-3 w-36">Reference</th>
							<th className="px-4 py-3">Memo</th>
							<th className="px-4 py-3 w-24">Status</th>
							<th className="px-4 py-3 w-16"></th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100 dark:divide-white/5">
						{gljc.loading && (
							<tr>
								<td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400 dark:text-slate-500">
									Loading…
								</td>
							</tr>
						)}
						{!gljc.loading && gljc.journals.length === 0 && (
							<tr>
								<td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400 dark:text-slate-500">
									No journal entries yet.
								</td>
							</tr>
						)}
						{gljc.journals.map((j) => (
							<tr key={j.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
								<td className="px-4 py-3 tabular-nums text-gray-500 dark:text-slate-400">{j.journal_date}</td>
								<td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-slate-300">{j.reference}</td>
								<td className="px-4 py-3 text-gray-600 dark:text-slate-400 truncate max-w-xs">{j.memo ?? "—"}</td>
								<td className="px-4 py-3">
									<span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_STYLES[j.status] ?? ""}`}>
										{j.status}
									</span>
								</td>
								<td className="px-4 py-3 text-right">
									<Link
										href={`/gl/journals/${j.id}`}
										className="text-xs text-gray-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors"
									>
										Open
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
