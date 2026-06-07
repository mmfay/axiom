"use client";

import { useState, useEffect } from "react";
import DimensionPicker from "@/app/components/GL/DimensionPicker";
import { GLJournal, GLJournalLine, CreateGLJournalRequest } from "@/app/lib/types/gl_journals";
import { GLAccount } from "@/app/lib/types/gl_accounts";
import { DimensionWithValues } from "@/app/lib/types/gl_dimensions";

interface Props {
	journal?: GLJournal;
	accounts: GLAccount[];
	dimensions: DimensionWithValues[];
	saving: boolean;
	posting: boolean;
	voiding: boolean;
	onSave: (payload: CreateGLJournalRequest) => void;
	onPost: (payload: CreateGLJournalRequest) => void;
	onVoid: () => void;
}

function today() {
	return new Date().toISOString().split("T")[0];
}

function blankLine(): GLJournalLine {
	return {
		account_id: null,
		description: "",
		debit: 0,
		credit: 0,
		dim1_value_id: null,
		dim2_value_id: null,
		dim3_value_id: null,
		dim4_value_id: null,
		dim5_value_id: null,
	};
}

const inputClass =
	"text-sm px-3 py-1.5 bg-transparent border border-gray-200 dark:border-white/10 rounded-md text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50";

const numClass =
	"text-sm px-2 py-1.5 w-28 bg-transparent border border-gray-200 dark:border-white/10 rounded-md text-right tabular-nums text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50";

export default function JournalForm({ journal, accounts, dimensions, saving, posting, voiding, onSave, onPost, onVoid }: Props) {

	const isNew = !journal;
	const isPosted = journal?.status === "posted";
	const isVoided = journal?.status === "voided";
	const locked = isPosted || isVoided;

	const [journalDate, setJournalDate] = useState(journal?.journal_date ?? today());
	const [memo, setMemo] = useState(journal?.memo ?? "");
	const [lines, setLines] = useState<GLJournalLine[]>(
		journal?.lines?.length ? journal.lines : [blankLine(), blankLine()]
	);

	useEffect(() => {
		if (!journal) return;
		setJournalDate(journal.journal_date ?? today());
		setMemo(journal.memo ?? "");
		setLines(journal.lines?.length ? journal.lines : [blankLine(), blankLine()]);
	}, [journal?.id, journal?.status]);

	const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
	const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
	const balanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;
	const hasDimensions = dimensions.some((d) => d.is_active);

	function setLine(index: number, patch: Partial<GLJournalLine>) {
		setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
	}

	function buildPayload(): CreateGLJournalRequest {
		return {
			journal_date: journalDate,
			memo: memo || undefined,
			lines: lines.map((l) => ({
				account_id: l.account_id!,
				description: l.description || null,
				debit: Number(l.debit) || 0,
				credit: Number(l.credit) || 0,
				dim1_value_id: l.dim1_value_id,
				dim2_value_id: l.dim2_value_id,
				dim3_value_id: l.dim3_value_id,
				dim4_value_id: l.dim4_value_id,
				dim5_value_id: l.dim5_value_id,
			})),
		};
	}

	return (
		<div className="p-8 flex flex-col gap-6 max-w-6xl">

			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold text-gray-900 dark:text-white">
						{isNew ? "New Journal Entry" : journal?.reference}
					</h1>
					<p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">General Journal</p>
				</div>

				{journal && (
					<span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
						journal.status === "posted"
							? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
							: journal.status === "voided"
							? "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-slate-400"
							: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
					}`}>
						{journal.status}
					</span>
				)}
			</div>

			{/* Journal header fields */}
			<div className="flex flex-wrap gap-4">
				<div className="flex flex-col gap-1">
					<label className="text-xs text-gray-500 dark:text-slate-400">Date</label>
					<input
						type="date"
						value={journalDate}
						disabled={locked}
						onChange={(e) => setJournalDate(e.target.value)}
						className={inputClass}
					/>
				</div>
				<div className="flex flex-col gap-1 flex-1 min-w-48">
					<label className="text-xs text-gray-500 dark:text-slate-400">Memo</label>
					<input
						type="text"
						value={memo}
						disabled={locked}
						onChange={(e) => setMemo(e.target.value)}
						placeholder="Description of this journal entry"
						className={`${inputClass} w-full`}
					/>
				</div>
			</div>

			{/* Lines */}
			<div className="flex flex-col gap-2">
				<div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
					<table className="w-full text-sm text-left">
						<thead className="text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
							<tr>
								<th className="px-3 py-2">Account</th>
								<th className="px-3 py-2">Description</th>
								<th className="px-3 py-2 w-28 text-right">Debit</th>
								<th className="px-3 py-2 w-28 text-right">Credit</th>
								{hasDimensions && <th className="px-3 py-2">Dimensions</th>}
								{!locked && <th className="px-3 py-2 w-8"></th>}
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100 dark:divide-white/5">
							{lines.map((line, i) => (
								<tr key={i} className="align-top">
									<td className="px-3 py-2 min-w-48">
										<select
											disabled={locked}
											value={line.account_id ?? ""}
											onChange={(e) => setLine(i, { account_id: e.target.value ? Number(e.target.value) : null })}
											className="text-sm px-2 py-1 w-full bg-transparent border border-gray-200 dark:border-white/10 rounded text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
										>
											<option value="">— Select account —</option>
											{accounts.map((a) => (
												<option key={a.id} value={a.id}>
													{a.account_number} – {a.name}
												</option>
											))}
										</select>
									</td>
									<td className="px-3 py-2 min-w-40">
										<input
											type="text"
											disabled={locked}
											value={line.description ?? ""}
											onChange={(e) => setLine(i, { description: e.target.value })}
											placeholder="Optional"
											className="text-sm px-2 py-1 w-full bg-transparent border border-gray-200 dark:border-white/10 rounded text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
										/>
									</td>
									<td className="px-3 py-2">
										<input
											type="number"
											min="0"
											step="0.01"
											disabled={locked}
											value={line.debit || ""}
											onChange={(e) => setLine(i, { debit: Number(e.target.value) || 0 })}
											className={numClass}
										/>
									</td>
									<td className="px-3 py-2">
										<input
											type="number"
											min="0"
											step="0.01"
											disabled={locked}
											value={line.credit || ""}
											onChange={(e) => setLine(i, { credit: Number(e.target.value) || 0 })}
											className={numClass}
										/>
									</td>
									{hasDimensions && (
										<td className="px-3 py-2">
											<DimensionPicker
												dimensions={dimensions}
												value={line}
												onChange={(slot, valueId) => setLine(i, { [`dim${slot}_value_id`]: valueId } as Partial<GLJournalLine>)}
												disabled={locked}
											/>
										</td>
									)}
									{!locked && (
										<td className="px-3 py-2">
											<button
												onClick={() => setLines((prev) => prev.filter((_, j) => j !== i))}
												disabled={lines.length <= 2}
												className="text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</td>
									)}
								</tr>
							))}
						</tbody>
						<tfoot className="border-t-2 border-gray-200 dark:border-white/20 bg-gray-50 dark:bg-white/5">
							<tr>
								<td colSpan={2} className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
									Total
								</td>
								<td className={`px-3 py-2 text-right tabular-nums font-semibold text-sm ${balanced ? "text-gray-900 dark:text-white" : "text-red-600 dark:text-red-400"}`}>
									{totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
								</td>
								<td className={`px-3 py-2 text-right tabular-nums font-semibold text-sm ${balanced ? "text-gray-900 dark:text-white" : "text-red-600 dark:text-red-400"}`}>
									{totalCredit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
								</td>
								{hasDimensions && <td />}
								{!locked && <td />}
							</tr>
						</tfoot>
					</table>
				</div>

				{!locked && (
					<button
						onClick={() => setLines((prev) => [...prev, blankLine()])}
						className="self-start text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
					>
						+ Add line
					</button>
				)}
			</div>

			{/* Balance indicator + actions */}
			<div className="flex items-center justify-between">
				<div>
					{totalDebit > 0 && (
						<span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
							balanced
								? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
								: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10"
						}`}>
							{balanced ? (
								<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
								</svg>
							) : (
								<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
								</svg>
							)}
							{balanced ? "Balanced" : "Out of balance"}
						</span>
					)}
				</div>

				<div className="flex items-center gap-2">
					{isPosted && (
						<button
							onClick={onVoid}
							disabled={voiding}
							className="px-4 py-1.5 text-sm border border-red-300 dark:border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
						>
							{voiding ? "Voiding…" : "Void"}
						</button>
					)}
					{!locked && (
						<>
							<button
								onClick={() => onSave(buildPayload())}
								disabled={saving}
								className="px-4 py-1.5 text-sm border border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-md transition-colors disabled:opacity-50"
							>
								{saving ? "Saving…" : "Save Draft"}
							</button>
							<button
								onClick={() => onPost(buildPayload())}
								disabled={posting || !balanced}
								className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors disabled:opacity-50"
							>
								{posting ? "Posting…" : "Post"}
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
