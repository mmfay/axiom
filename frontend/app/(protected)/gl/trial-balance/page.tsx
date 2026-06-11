"use client";

import { useEffect, useState } from "react";
import { ApiResponse } from "@/app/lib/api/response";
import { getTrialBalance } from "@/app/lib/api/gl_reporting";
import { TrialBalance } from "@/app/lib/types/gl_reporting";
import ErrorBanner from "@/app/components/ErrorBanner";

function today(): string {
	return new Date().toISOString().split("T")[0];
}

function fmt(n: number): string {
	if (n === 0) return "";
	return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtTotal(n: number): string {
	return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TrialBalancePage() {
	const [asOf, setAsOf] = useState(today());
	const [data, setData] = useState<TrialBalance | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [dismissedError, setDismissedError] = useState<string | null>(null);

	async function load(date: string) {
		setLoading(true);
		setError(null);
		try {
			const res = ApiResponse.handle(await getTrialBalance(date));
			if (!res.ok || !res.data) {
				setError(res.message ?? "Failed to load trial balance");
				return;
			}
			setData(res.data);
		} catch {
			setError("Failed to load trial balance");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => { load(asOf); }, []);

	const balanced = data ? Math.abs(data.total_debit - data.total_credit) < 0.01 : true;

	return (
		<div className="p-8 flex flex-col gap-6 max-w-5xl">

			{/* Header */}
			<div className="flex items-end justify-between">
				<div>
					<h1 className="text-xl font-semibold text-gray-900 dark:text-white">Trial Balance</h1>
					<p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Net balances per account as of a given date</p>
				</div>

				<div className="flex items-center gap-3">
					<input
						type="date"
						value={asOf}
						onChange={(e) => setAsOf(e.target.value)}
						className="text-sm px-3 py-1.5 bg-transparent border border-gray-200 dark:border-white/10 rounded-md text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
					/>
					<button
						onClick={() => load(asOf)}
						disabled={loading}
						className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors disabled:opacity-50"
					>
						{loading ? "Loading…" : "Run"}
					</button>
				</div>
			</div>

			{error && error !== dismissedError && (
				<ErrorBanner message={error} onDismiss={() => setDismissedError(error)} />
			)}

			{data && (
				<div className="flex flex-col gap-3">

					{/* Balance indicator */}
					<div className="flex items-center gap-2">
						{balanced ? (
							<span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
								<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
								</svg>
								Balanced
							</span>
						) : (
							<span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-full">
								<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
								</svg>
								Out of balance
							</span>
						)}
						<span className="text-xs text-gray-400 dark:text-slate-500">As of {data.as_of}</span>
					</div>

					{/* Table */}
					<div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
						<table className="w-full text-sm text-left">
							<thead className="text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
								<tr>
									<th className="px-4 py-3 w-28">Account</th>
									<th className="px-4 py-3">Name</th>
									<th className="px-4 py-3 w-32">Type</th>
									<th className="px-4 py-3 w-36 text-right">Debit</th>
									<th className="px-4 py-3 w-36 text-right">Credit</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100 dark:divide-white/5">
								{data.rows.length === 0 ? (
									<tr>
										<td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400 dark:text-slate-500">
											No activity as of {data.as_of}
										</td>
									</tr>
								) : (
									data.rows.map((row) => (
										<tr key={row.account_number} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
											<td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-slate-400">{row.account_number}</td>
											<td className="px-4 py-3 text-gray-800 dark:text-slate-200">{row.name}</td>
											<td className="px-4 py-3 text-gray-500 dark:text-slate-400">{row.account_type}</td>
											<td className="px-4 py-3 text-right tabular-nums text-gray-800 dark:text-slate-200">{fmt(row.debit)}</td>
											<td className="px-4 py-3 text-right tabular-nums text-gray-800 dark:text-slate-200">{fmt(row.credit)}</td>
										</tr>
									))
								)}
							</tbody>
							<tfoot className="border-t-2 border-gray-200 dark:border-white/20 bg-gray-50 dark:bg-white/5">
								<tr>
									<td colSpan={3} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
										Total
									</td>
									<td className={`px-4 py-3 text-right tabular-nums font-semibold ${balanced ? "text-gray-900 dark:text-white" : "text-red-600 dark:text-red-400"}`}>
										{fmtTotal(data.total_debit)}
									</td>
									<td className={`px-4 py-3 text-right tabular-nums font-semibold ${balanced ? "text-gray-900 dark:text-white" : "text-red-600 dark:text-red-400"}`}>
										{fmtTotal(data.total_credit)}
									</td>
								</tr>
							</tfoot>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
