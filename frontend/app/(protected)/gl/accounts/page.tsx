"use client";

import { useState } from "react";
import PageHandler from "@/app/components/Tables/PageHandler";
import FilterPanel from "@/app/components/Filters/FilterPanel";
import GLAccountCreateModal from "@/app/components/Modals/GL/GLAccountCreate";
import GLAccountEditModal from "@/app/components/Modals/GL/GLAccountEdit";
import { useGLAccountsController } from "@/app/lib/hooks/useGLAccountsController";
import { useFilterController } from "@/app/lib/hooks/useFilterController";
import { FILTER_FIELDS_GL_ACCOUNTS } from "@/app/lib/staticData";
import { GLAccount } from "@/app/lib/types/gl_accounts";

const TYPE_COLORS: Record<string, string> = {
	Asset:     "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
	Liability: "bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
	Equity:    "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
	Revenue:   "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
	Expense:   "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
};

export default function GLAccountsPage() {

	const {
		accounts,
		loading,
		error,
		nextPage,
		prevPage,
		showPrev,
		showNext,
		pageNumber,
		setItemFiltersState,
		clearFilters,
		onCreate,
		onUpdate,
	} = useGLAccountsController();

	const [showCreate, setShowCreate] = useState(false);
	const [editAccount, setEditAccount] = useState<GLAccount | null>(null);
	const filter = useFilterController(FILTER_FIELDS_GL_ACCOUNTS);

	function handleApply(next: Record<string, string>) {
		filter.onApply(next);
		setItemFiltersState({
			base_fields: Object.entries(next)
				.filter(([, v]) => v)
				.map(([field_id, filter_value]) => ({ field_id, filter_value })),
		});
	}

	function handleClear() {
		filter.onClear();
		clearFilters();
	}

	return (
		<div className="p-8 flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold text-gray-900 dark:text-white">Chart of Accounts</h1>
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
					<button
						onClick={() => setShowCreate(true)}
						className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
					>
						Create
					</button>
				</div>
			</div>

			{showCreate && (
				<GLAccountCreateModal
					onClose={() => setShowCreate(false)}
					onCreate={onCreate}
				/>
			)}

			{editAccount && (
				<GLAccountEditModal
					account={editAccount}
					onClose={() => setEditAccount(null)}
					onUpdate={onUpdate}
				/>
			)}

			<FilterPanel
				open={filter.open}
				onClose={filter.onClose}
				fields={filter.fields}
				current={filter.filters}
				onApply={handleApply}
				onClear={handleClear}
			/>

			{error && <p className="text-red-500 text-sm">{error}</p>}

			<PageHandler
				pageLength={accounts.length}
				prevOnClick={prevPage}
				showPrev={showPrev}
				nextOnClick={nextPage}
				showNext={showNext}
				loading={loading}
				pageNumber={pageNumber}
			/>

			<div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
				<table className="w-full table-fixed text-sm text-left text-gray-800 dark:text-slate-300">
					<thead className="text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
						<tr>
							<th className="px-4 py-3 w-32">Number</th>
							<th className="px-4 py-3">Name</th>
							<th className="px-4 py-3 w-36">Type</th>
							<th className="px-4 py-3 w-28">Balance</th>
							<th className="px-4 py-3 w-24">Status</th>
							<th className="px-4 py-3 w-20"></th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100 dark:divide-white/5">
						{loading && (
							<tr>
								<td colSpan={6} className="px-4 py-6 text-gray-500 dark:text-slate-400">Loading...</td>
							</tr>
						)}
						{!loading && accounts.length === 0 && (
							<tr>
								<td colSpan={6} className="px-4 py-6 text-gray-500 dark:text-slate-400">No accounts found.</td>
							</tr>
						)}
						{accounts.map((account) => (
							<tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
								<td className="px-4 py-3 font-mono text-gray-900 dark:text-slate-200">{account.account_number}</td>
								<td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-200">
									{account.name}
									{account.description && (
										<p className="text-xs text-gray-400 dark:text-slate-500 font-normal mt-0.5">{account.description}</p>
									)}
								</td>
								<td className="px-4 py-3">
									<span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[account.account_type] ?? "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-slate-300"}`}>
										{account.account_type}
									</span>
								</td>
								<td className="px-4 py-3 capitalize text-gray-500 dark:text-slate-400">{account.normal_balance}</td>
								<td className="px-4 py-3">
									<span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
										account.is_active
											? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
											: "bg-gray-100 text-gray-500 dark:bg-slate-500/15 dark:text-slate-400"
									}`}>
										{account.is_active ? "Active" : "Inactive"}
									</span>
								</td>
								<td className="px-4 py-3 text-right">
									<button
										onClick={() => setEditAccount(account)}
										className="text-xs text-gray-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors"
									>
										Edit
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
