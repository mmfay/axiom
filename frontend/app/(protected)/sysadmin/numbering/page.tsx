"use client";

import { useEffect, useState } from "react";
import { ApiResponse } from "@/app/lib/api/response";
import { getSchemes, createScheme, updateScheme } from "@/app/lib/api/numbering";
import { NumberingScheme, UpdateNumberingSchemeRequest, DOCUMENT_TYPE_LABELS } from "@/app/lib/types/numbering";

const KNOWN_TYPES = Object.keys(DOCUMENT_TYPE_LABELS);

function preview(s: Pick<NumberingScheme, "prefix" | "separator" | "padding" | "include_year" | "include_month" | "next_value">): string {
	const today = new Date();
	const parts: string[] = [];
	if (s.prefix) parts.push(s.prefix);
	if (s.include_year) parts.push(String(today.getFullYear()));
	if (s.include_month) parts.push(String(today.getMonth() + 1).padStart(2, "0"));
	parts.push(String(s.next_value ?? 1).padStart(s.padding ?? 4, "0"));
	return parts.join(s.separator ?? "-");
}

const inputClass = "text-sm px-3 py-1.5 bg-transparent border border-gray-200 dark:border-white/10 rounded-md text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 w-full";
const labelClass = "text-xs text-gray-500 dark:text-slate-400";

interface FormState {
	document_type: string;
	prefix: string;
	separator: string;
	padding: number;
	include_year: boolean;
	include_month: boolean;
	next_value: number;
	is_active: boolean;
}

function blankForm(): FormState {
	return {
		document_type: KNOWN_TYPES[0] ?? "gl_journal",
		prefix: "",
		separator: "-",
		padding: 4,
		include_year: false,
		include_month: false,
		next_value: 1,
		is_active: true,
	};
}

export default function NumberingSchemesPage() {
	const [schemes, setSchemes] = useState<NumberingScheme[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [showCreate, setShowCreate] = useState(false);
	const [editScheme, setEditScheme] = useState<NumberingScheme | null>(null);
	const [form, setForm] = useState<FormState>(blankForm());
	const [saving, setSaving] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	async function load() {
		const res = ApiResponse.handle(await getSchemes());
		if (res.ok && res.data) setSchemes(res.data);
		else setError(res.message ?? "Failed to load");
		setLoading(false);
	}

	useEffect(() => { load(); }, []);

	function openCreate() {
		setForm(blankForm());
		setFormError(null);
		setShowCreate(true);
		setEditScheme(null);
	}

	function openEdit(s: NumberingScheme) {
		setForm({
			document_type: s.document_type,
			prefix: s.prefix,
			separator: s.separator,
			padding: s.padding,
			include_year: s.include_year,
			include_month: s.include_month,
			next_value: s.next_value,
			is_active: s.is_active,
		});
		setFormError(null);
		setEditScheme(s);
		setShowCreate(false);
	}

	function closeForm() {
		setShowCreate(false);
		setEditScheme(null);
	}

	async function handleSave() {
		setSaving(true);
		setFormError(null);
		try {
			if (editScheme) {
				const patch: UpdateNumberingSchemeRequest = {
					prefix: form.prefix,
					separator: form.separator,
					padding: form.padding,
					include_year: form.include_year,
					include_month: form.include_month,
					next_value: form.next_value,
					is_active: form.is_active,
				};
				const res = ApiResponse.handle(await updateScheme(editScheme.id, patch));
				if (!res.ok) { setFormError(res.message ?? "Failed to save"); return; }
			} else {
				const res = ApiResponse.handle(await createScheme({
					document_type: form.document_type,
					prefix: form.prefix,
					separator: form.separator,
					padding: form.padding,
					include_year: form.include_year,
					include_month: form.include_month,
					next_value: form.next_value,
				}));
				if (!res.ok) { setFormError(res.message ?? "Failed to save"); return; }
			}
			closeForm();
			await load();
		} finally {
			setSaving(false);
		}
	}

	const formVisible = showCreate || !!editScheme;
	const previewStr = preview(form);
	const existingTypes = schemes.map((s) => s.document_type);

	return (
		<div className="p-8 flex flex-col gap-6 max-w-3xl">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold text-gray-900 dark:text-white">Numbering Schemes</h1>
					<p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Define auto-numbering formats per document type</p>
				</div>
				<button
					onClick={openCreate}
					className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
				>
					New Scheme
				</button>
			</div>

			{error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

			{/* Form panel */}
			{formVisible && (
				<div className="border border-gray-200 dark:border-white/10 rounded-lg p-5 flex flex-col gap-5 bg-gray-50 dark:bg-white/3">
					<h2 className="text-sm font-semibold text-gray-800 dark:text-slate-200">
						{editScheme ? "Edit Scheme" : "New Scheme"}
					</h2>

					<div className="grid grid-cols-2 gap-4">
						{/* Document type — only shown when creating */}
						{!editScheme && (
							<div className="col-span-2 flex flex-col gap-1">
								<label className={labelClass}>Document Type</label>
								<select
									value={form.document_type}
									onChange={(e) => setForm({ ...form, document_type: e.target.value })}
									className={inputClass}
								>
									{KNOWN_TYPES.filter((t) => !existingTypes.includes(t)).map((t) => (
										<option key={t} value={t}>{DOCUMENT_TYPE_LABELS[t]}</option>
									))}
								</select>
							</div>
						)}

						<div className="flex flex-col gap-1">
							<label className={labelClass}>Prefix</label>
							<input
								type="text"
								value={form.prefix}
								onChange={(e) => setForm({ ...form, prefix: e.target.value })}
								placeholder="JE"
								className={inputClass}
							/>
						</div>

						<div className="flex flex-col gap-1">
							<label className={labelClass}>Separator</label>
							<input
								type="text"
								value={form.separator}
								onChange={(e) => setForm({ ...form, separator: e.target.value })}
								placeholder="-"
								maxLength={3}
								className={inputClass}
							/>
						</div>

						<div className="flex flex-col gap-1">
							<label className={labelClass}>Number Padding</label>
							<input
								type="number"
								min={1}
								max={10}
								value={form.padding}
								onChange={(e) => setForm({ ...form, padding: Number(e.target.value) || 4 })}
								className={inputClass}
							/>
						</div>

						<div className="flex flex-col gap-1">
							<label className={labelClass}>Next Value</label>
							<input
								type="number"
								min={1}
								value={form.next_value}
								onChange={(e) => setForm({ ...form, next_value: Number(e.target.value) || 1 })}
								className={inputClass}
							/>
						</div>

						<div className="col-span-2 flex items-center gap-6">
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									checked={form.include_year}
									onChange={(e) => setForm({ ...form, include_year: e.target.checked })}
									className="w-4 h-4 accent-indigo-600"
								/>
								<span className="text-sm text-gray-700 dark:text-slate-300">Include year</span>
							</label>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									checked={form.include_month}
									onChange={(e) => setForm({ ...form, include_month: e.target.checked })}
									className="w-4 h-4 accent-indigo-600"
								/>
								<span className="text-sm text-gray-700 dark:text-slate-300">Include month</span>
							</label>
							{editScheme && (
								<label className="flex items-center gap-2 cursor-pointer ml-auto">
									<input
										type="checkbox"
										checked={form.is_active}
										onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
										className="w-4 h-4 accent-indigo-600"
									/>
									<span className="text-sm text-gray-700 dark:text-slate-300">Active</span>
								</label>
							)}
						</div>
					</div>

					{/* Preview */}
					<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
						<span>Preview:</span>
						<span className="font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-sm">
							{previewStr}
						</span>
					</div>

					{formError && <p className="text-sm text-red-500 dark:text-red-400">{formError}</p>}

					<div className="flex items-center gap-2">
						<button
							onClick={handleSave}
							disabled={saving}
							className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors disabled:opacity-50"
						>
							{saving ? "Saving…" : "Save"}
						</button>
						<button
							onClick={closeForm}
							className="px-4 py-1.5 text-sm border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md transition-colors"
						>
							Cancel
						</button>
					</div>
				</div>
			)}

			{/* Schemes table */}
			<div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
				<table className="w-full text-sm text-left">
					<thead className="text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
						<tr>
							<th className="px-4 py-3">Document Type</th>
							<th className="px-4 py-3">Format</th>
							<th className="px-4 py-3 w-28">Next</th>
							<th className="px-4 py-3 w-20">Status</th>
							<th className="px-4 py-3 w-16"></th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100 dark:divide-white/5">
						{loading && (
							<tr>
								<td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400 dark:text-slate-500">Loading…</td>
							</tr>
						)}
						{!loading && schemes.length === 0 && (
							<tr>
								<td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400 dark:text-slate-500">No numbering schemes configured.</td>
							</tr>
						)}
						{schemes.map((s) => (
							<tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
								<td className="px-4 py-3 text-gray-800 dark:text-slate-200">{DOCUMENT_TYPE_LABELS[s.document_type] ?? s.document_type}</td>
								<td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-slate-400">{preview(s)}</td>
								<td className="px-4 py-3 tabular-nums text-gray-600 dark:text-slate-400">{s.next_value}</td>
								<td className="px-4 py-3">
									<span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
										s.is_active
											? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
											: "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-slate-400"
									}`}>
										{s.is_active ? "Active" : "Inactive"}
									</span>
								</td>
								<td className="px-4 py-3 text-right">
									<button
										onClick={() => openEdit(s)}
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
