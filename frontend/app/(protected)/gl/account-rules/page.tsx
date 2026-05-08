"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiResponse } from "@/app/lib/api/response";
import { getGLDimensions, getGLDimensionValues } from "@/app/lib/api/gl_dimensions";
import { getGLAccountsListPage } from "@/app/lib/api/gl_accounts";
import { getAccountRules, createAccountRule, updateAccountRule, deleteAccountRule, setAccountRuleValues } from "@/app/lib/api/gl_account_rules";
import { DimensionWithValues, GLDimensionValue } from "@/app/lib/types/gl_dimensions";
import { GLAccount } from "@/app/lib/types/gl_accounts";
import { AccountRule, CreateAccountRuleRequest } from "@/app/lib/types/gl_account_rules";
import RuleMapModal from "@/app/components/Modals/GL/RuleMapModal";
import SecureButton from "@/app/components/SecureButton";
import { usePermission } from "@/app/lib/hooks/usePermission";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slotLabel(slot: number) {
	return `D${slot}`;
}

// ─── Values picker ────────────────────────────────────────────────────────────

type ValuesPickerProps = {
	rule: AccountRule;
	allValues: GLDimensionValue[];
	onSave: (valueIds: number[]) => Promise<void>;
};

function ValuesPicker({ rule, allValues, onSave }: ValuesPickerProps) {
	const canWrite = usePermission("General_ledger.Write");
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<Set<number>>(new Set(rule.allowed_value_ids));
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		setSelected(new Set(rule.allowed_value_ids));
	}, [rule.allowed_value_ids.join(",")]);

	async function handleToggle(valueId: number) {
		const next = new Set(selected);
		if (next.has(valueId)) next.delete(valueId);
		else next.add(valueId);
		setSelected(next);

		setSaving(true);
		try {
			await onSave([...next]);
		} finally {
			setSaving(false);
		}
	}

	const activeValues = allValues.filter((v) => v.is_active);
	const hasRestrictions = rule.allowed_value_ids.length > 0;

	return (
		<div className="relative">
			<SecureButton
				permission="General_ledger.Write"
				onClick={() => setOpen((o) => !o)}
				className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
			>
				{hasRestrictions ? (
					<>
						{rule.allowed_value_ids.length} value{rule.allowed_value_ids.length !== 1 ? "s" : ""}
						<svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
						</svg>
					</>
				) : (
					<>
						Any value
						<svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
						</svg>
					</>
				)}
			</SecureButton>

			{open && (
				<div className="absolute top-full left-0 mt-1 z-20 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg shadow-lg overflow-hidden">
					<div className="px-3 py-2 border-b border-gray-100 dark:border-white/5">
						<p className="text-xs text-gray-400 dark:text-slate-500">
							{hasRestrictions ? "Restricted to:" : "All values allowed — restrict below"}
						</p>
					</div>
					<div className="max-h-48 overflow-y-auto">
						{activeValues.length === 0 ? (
							<p className="px-3 py-3 text-xs text-gray-400 dark:text-slate-500">No values configured</p>
						) : (
							activeValues.map((v) => (
								<label key={v.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer">
									<input
										type="checkbox"
										checked={selected.has(v.id)}
										onChange={() => handleToggle(v.id)}
										disabled={saving || !canWrite}
										className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
									/>
									<span className="font-mono text-xs text-gray-500 dark:text-slate-400">{v.code}</span>
									<span className="text-sm text-gray-800 dark:text-slate-200 truncate">{v.name}</span>
								</label>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}

// ─── Rule row ─────────────────────────────────────────────────────────────────

type RuleRowProps = {
	rule: AccountRule;
	dim: DimensionWithValues;
	parentLabel?: string;
	accountId: number;
	onUpdate: (rule: AccountRule) => void;
	onDelete: (ruleId: number) => void;
	onSetValues: (ruleId: number, valueIds: number[]) => void;
};

function RuleRow({ rule, dim, parentLabel, accountId, onUpdate, onDelete, onSetValues }: RuleRowProps) {
	const [toggling, setToggling] = useState(false);

	async function handleToggleRequired() {
		if (toggling) return;
		setToggling(true);
		try {
			const res = ApiResponse.handle(await updateAccountRule(accountId, rule.id, { is_required: !rule.is_required }));
			if (res.ok && res.data) onUpdate(res.data);
		} finally {
			setToggling(false);
		}
	}

	async function handleDelete() {
		const res = ApiResponse.handle(await deleteAccountRule(accountId, rule.id));
		if (res.ok) onDelete(rule.id);
	}

	async function handleSetValues(valueIds: number[]) {
		const res = ApiResponse.handle(await setAccountRuleValues(accountId, rule.id, { value_ids: valueIds }));
		if (res.ok && res.data) onSetValues(rule.id, res.data.allowed_value_ids);
	}

	return (
		<div className="flex items-center gap-3 px-4 py-3">
			<div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold">
				{slotLabel(dim.slot)}
			</div>

			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium text-gray-800 dark:text-slate-200">{dim.name}</p>
				{parentLabel && (
					<p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{parentLabel}</p>
				)}
			</div>

			<ValuesPicker rule={rule} allValues={dim.values} onSave={handleSetValues} />

			<SecureButton
				permission="General_ledger.Write"
				onClick={handleToggleRequired}
				disabled={toggling}
				className={`flex-shrink-0 text-xs px-2 py-1 rounded-full font-medium transition-colors disabled:opacity-50 ${
					rule.is_required
						? "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/25"
						: "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10"
				}`}
			>
				{rule.is_required ? "Required" : "Optional"}
			</SecureButton>

			<SecureButton
				permission="General_ledger.Write"
				onClick={handleDelete}
				className="flex-shrink-0 p-1.5 rounded text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors"
				aria-label="Delete rule"
			>
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
				</svg>
			</SecureButton>
		</div>
	);
}

// ─── Add rule form ─────────────────────────────────────────────────────────────

type AddRuleFormProps = {
	accountId: number;
	dimsWithValues: DimensionWithValues[];
	existingRules: AccountRule[];
	onCreated: (rule: AccountRule) => void;
	onCancel: () => void;
};

function AddRuleForm({ accountId, dimsWithValues, existingRules, onCreated, onCancel }: AddRuleFormProps) {
	const [dimensionId, setDimensionId] = useState<number | "">("");
	const [isRequired, setIsRequired] = useState(false);
	const [parentValueId, setParentValueId] = useState<number | "">("");
	const [allowedValueIds, setAllowedValueIds] = useState<Set<number>>(new Set());
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const parentValueIdNum = parentValueId === "" ? null : Number(parentValueId);

	// Dims that already have a rule at this parent level are not available
	const usedDimIds = new Set(
		existingRules
			.filter((r) => r.parent_value_id === parentValueIdNum)
			.map((r) => r.dimension_id)
	);

	// If a parent is selected, exclude its own dimension from the target
	const parentDimId = parentValueIdNum
		? dimsWithValues.find((d) => d.values.some((v) => v.id === parentValueIdNum))?.id
		: null;

	const availableDims = dimsWithValues.filter(
		(d) => !usedDimIds.has(d.id) && d.id !== parentDimId
	);

	const selectedDim = dimsWithValues.find((d) => d.id === Number(dimensionId));

	// All values across all active dims, for the parent value selector
	const allValues = dimsWithValues.flatMap((d) =>
		d.values.filter((v) => v.is_active).map((v) => ({ ...v, dimName: d.name, dimSlot: d.slot }))
	);

	function toggleAllowedValue(valueId: number) {
		setAllowedValueIds((prev) => {
			const next = new Set(prev);
			if (next.has(valueId)) next.delete(valueId);
			else next.add(valueId);
			return next;
		});
	}

	async function handleSubmit() {
		if (!dimensionId) { setError("Select a dimension"); return; }
		setError(null);
		setSaving(true);
		try {
			const body: CreateAccountRuleRequest = {
				dimension_id: Number(dimensionId),
				is_required: isRequired,
				parent_value_id: parentValueIdNum,
				allowed_value_ids: [...allowedValueIds],
			};
			const res = ApiResponse.handle(await createAccountRule(accountId, body));
			if (!res.ok || !res.data) throw new Error(res.message ?? "Failed to create rule");
			onCreated(res.data);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to create rule");
		} finally {
			setSaving(false);
		}
	}

	const inputCls = "w-full text-sm px-3 py-1.5 bg-transparent border border-gray-200 dark:border-white/10 rounded-md text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500";

	return (
		<div className="border border-gray-200 dark:border-white/10 rounded-lg p-4 flex flex-col gap-4 bg-gray-50/50 dark:bg-white/[0.02]">
			<p className="text-sm font-medium text-gray-700 dark:text-slate-300">New rule</p>

			<div className="grid grid-cols-2 gap-3">
				{/* Dimension */}
				<div className="flex flex-col gap-1">
					<label className="text-xs text-gray-500 dark:text-slate-400">Dimension</label>
					<select
						value={dimensionId}
						onChange={(e) => { setDimensionId(e.target.value === "" ? "" : Number(e.target.value)); setAllowedValueIds(new Set()); }}
						className={inputCls}
					>
						<option value="">Select dimension…</option>
						{availableDims.map((d) => (
							<option key={d.id} value={d.id}>{slotLabel(d.slot)} — {d.name}</option>
						))}
					</select>
				</div>

				{/* Parent condition */}
				<div className="flex flex-col gap-1">
					<label className="text-xs text-gray-500 dark:text-slate-400">Applies when</label>
					<select
						value={parentValueId}
						onChange={(e) => setParentValueId(e.target.value === "" ? "" : Number(e.target.value))}
						className={inputCls}
					>
						<option value="">Always (top-level)</option>
						{dimsWithValues.map((d) => {
							const active = d.values.filter((v) => v.is_active);
							if (active.length === 0) return null;
							return (
								<optgroup key={d.id} label={`${slotLabel(d.slot)} — ${d.name}`}>
									{active.map((v) => (
										<option key={v.id} value={v.id}>{v.code} — {v.name}</option>
									))}
								</optgroup>
							);
						})}
					</select>
				</div>
			</div>

			{/* Required toggle */}
			<label className="flex items-center gap-3 cursor-pointer w-fit">
				<button
					type="button"
					onClick={() => setIsRequired((v) => !v)}
					className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isRequired ? "bg-indigo-600" : "bg-gray-200 dark:bg-white/10"}`}
				>
					<span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${isRequired ? "translate-x-4.5" : "translate-x-0.5"}`} />
				</button>
				<span className="text-sm text-gray-700 dark:text-slate-300">Required</span>
			</label>

			{/* Allowed values */}
			{selectedDim && selectedDim.values.filter((v) => v.is_active).length > 0 && (
				<div className="flex flex-col gap-2">
					<p className="text-xs text-gray-500 dark:text-slate-400">
						Allowed values <span className="text-gray-400">(leave all unchecked to allow any)</span>
					</p>
					<div className="flex flex-wrap gap-2">
						{selectedDim.values.filter((v) => v.is_active).map((v) => (
							<label key={v.id} className="flex items-center gap-1.5 cursor-pointer">
								<input
									type="checkbox"
									checked={allowedValueIds.has(v.id)}
									onChange={() => toggleAllowedValue(v.id)}
									className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
								/>
								<span className="text-xs text-gray-700 dark:text-slate-300">
									<span className="font-mono text-gray-400 dark:text-slate-500">{v.code}</span> {v.name}
								</span>
							</label>
						))}
					</div>
				</div>
			)}

			{error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}

			<div className="flex gap-2 pt-1">
				<button
					onClick={handleSubmit}
					disabled={saving || !dimensionId}
					className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors disabled:opacity-50"
				>
					Add rule
				</button>
				<button
					onClick={onCancel}
					className="px-4 py-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
				>
					Cancel
				</button>
			</div>
		</div>
	);
}

// ─── Rule editor ──────────────────────────────────────────────────────────────

type RuleEditorProps = {
	account: GLAccount;
	dimsWithValues: DimensionWithValues[];
	rules: AccountRule[];
	loading: boolean;
	setRules: (rules: AccountRule[]) => void;
};

function RuleEditor({ account, dimsWithValues, rules, loading, setRules }: RuleEditorProps) {
	const [showAdd, setShowAdd] = useState(false);
	const [showMap, setShowMap] = useState(false);

	const dimById = new Map(dimsWithValues.map((d) => [d.id, d]));
	const valueById = new Map(
		dimsWithValues.flatMap((d) => d.values.map((v) => [v.id, { ...v, dimSlot: d.slot, dimName: d.name }]))
	);

	const topLevel = rules.filter((r) => r.parent_value_id === null);
	const conditional = rules.filter((r) => r.parent_value_id !== null);

	// Group conditional rules by parent value id
	const byParent = new Map<number, AccountRule[]>();
	for (const r of conditional) {
		const key = r.parent_value_id!;
		if (!byParent.has(key)) byParent.set(key, []);
		byParent.get(key)!.push(r);
	}

	function handleUpdate(updated: AccountRule) {
		setRules(rules.map((r) => (r.id === updated.id ? updated : r)));
	}

	function handleDelete(ruleId: number) {
		setRules(rules.filter((r) => r.id !== ruleId));
	}

	function handleSetValues(ruleId: number, valueIds: number[]) {
		setRules(rules.map((r) => (r.id === ruleId ? { ...r, allowed_value_ids: valueIds } : r)));
	}

	function handleCreated(rule: AccountRule) {
		setRules([...rules, rule]);
		setShowAdd(false);
	}

	const ruleRowProps = { accountId: account.id, onUpdate: handleUpdate, onDelete: handleDelete, onSetValues: handleSetValues };

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-start justify-between">
				<div>
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">{account.name}</h2>
					<p className="text-sm text-gray-500 dark:text-slate-400">{account.account_number} · {account.account_type}</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={() => setShowMap(true)}
						className="px-4 py-2 text-sm border border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-md transition-colors flex items-center gap-1.5"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
						</svg>
						View Map
					</button>
					{!showAdd && (
						<SecureButton
							permission="General_ledger.Write"
							onClick={() => setShowAdd(true)}
							className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
						>
							Add Rule
						</SecureButton>
					)}
				</div>
			</div>

			{showAdd && (
				<AddRuleForm
					accountId={account.id}
					dimsWithValues={dimsWithValues}
					existingRules={rules}
					onCreated={handleCreated}
					onCancel={() => setShowAdd(false)}
				/>
			)}

			{loading ? (
				<p className="text-sm text-gray-400 dark:text-slate-500">Loading rules…</p>
			) : rules.length === 0 && !showAdd ? (
				<div className="border border-dashed border-gray-200 dark:border-white/10 rounded-lg px-6 py-10 text-center">
					<p className="text-sm text-gray-400 dark:text-slate-500">No rules configured for this account.</p>
					<p className="text-xs text-gray-400 dark:text-slate-500 mt-1">All dimension combinations are currently permitted.</p>
				</div>
			) : (
				<>
					{/* Top-level rules */}
					{topLevel.length > 0 && (
						<div className="flex flex-col gap-1">
							<p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">Always applies</p>
							<div className="border border-gray-200 dark:border-white/10 rounded-lg divide-y divide-gray-100 dark:divide-white/5">
								{topLevel.map((rule) => {
									const dim = dimById.get(rule.dimension_id);
									if (!dim) return null;
									return <RuleRow key={rule.id} rule={rule} dim={dim} {...ruleRowProps} />;
								})}
							</div>
						</div>
					)}

					{/* Conditional rules grouped by parent value */}
					{byParent.size > 0 && (
						<div className="flex flex-col gap-4">
							<p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">Conditional</p>
							{[...byParent.entries()].map(([parentValueId, childRules]) => {
								const parentValue = valueById.get(parentValueId);
								const parentLabel = parentValue
									? `When ${parentValue.dimName} = ${parentValue.name}`
									: `When value ${parentValueId}`;
								return (
									<div key={parentValueId} className="flex flex-col gap-1">
										<p className="text-xs text-gray-500 dark:text-slate-400 font-medium pl-1">{parentLabel}</p>
										<div className="border border-gray-200 dark:border-white/10 rounded-lg divide-y divide-gray-100 dark:divide-white/5">
											{childRules.map((rule) => {
												const dim = dimById.get(rule.dimension_id);
												if (!dim) return null;
												return (
													<RuleRow
														key={rule.id}
														rule={rule}
														dim={dim}
														parentLabel={parentLabel}
														{...ruleRowProps}
													/>
												);
											})}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</>
			)}

			{showMap && (
				<RuleMapModal
					account={account}
					rules={rules}
					dimsWithValues={dimsWithValues}
					onClose={() => setShowMap(false)}
				/>
			)}
		</div>
	);
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AccountRulesPage() {
	const [accounts, setAccounts] = useState<GLAccount[]>([]);
	const [accountSearch, setAccountSearch] = useState("");
	const [loadingAccounts, setLoadingAccounts] = useState(true);

	const [dimsWithValues, setDimsWithValues] = useState<DimensionWithValues[]>([]);
	const [loadingDims, setLoadingDims] = useState(true);

	const [selectedAccount, setSelectedAccount] = useState<GLAccount | null>(null);
	const [rules, setRules] = useState<AccountRule[]>([]);
	const [loadingRules, setLoadingRules] = useState(false);

	// Load accounts
	useEffect(() => {
		(async () => {
			setLoadingAccounts(true);
			try {
				const res = ApiResponse.handle(await getGLAccountsListPage());
				if (res.ok && res.data) setAccounts(res.data.items);
			} finally {
				setLoadingAccounts(false);
			}
		})();
	}, []);

	// Load active dimensions + their values
	useEffect(() => {
		(async () => {
			setLoadingDims(true);
			try {
				const dimRes = ApiResponse.handle(await getGLDimensions());
				if (!dimRes.ok || !dimRes.data) return;

				const active = dimRes.data.filter((d) => d.is_active);

				const valueResults = await Promise.all(
					active.map((d) => getGLDimensionValues(d.id))
				);

				setDimsWithValues(
					active.map((d, i) => ({
						...d,
						values: (ApiResponse.handle(valueResults[i]).data ?? []),
					}))
				);
			} finally {
				setLoadingDims(false);
			}
		})();
	}, []);

	const handleSelectAccount = useCallback(async (account: GLAccount) => {
		setSelectedAccount(account);
		setRules([]);
		setLoadingRules(true);
		try {
			const res = ApiResponse.handle(await getAccountRules(account.id));
			if (res.ok && res.data) setRules(res.data.rules);
		} finally {
			setLoadingRules(false);
		}
	}, []);

	const filteredAccounts = accounts.filter(
		(a) =>
			a.account_number.toLowerCase().includes(accountSearch.toLowerCase()) ||
			a.name.toLowerCase().includes(accountSearch.toLowerCase())
	);

	return (
		<div className="flex gap-0 h-full">
			{/* Sidebar */}
			<div className="w-72 flex-shrink-0 border-r border-gray-200 dark:border-white/10 flex flex-col">
				<div className="p-4 border-b border-gray-200 dark:border-white/10">
					<h1 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Account Rules</h1>
					<input
						type="text"
						value={accountSearch}
						onChange={(e) => setAccountSearch(e.target.value)}
						placeholder="Search accounts…"
						className="w-full text-sm px-3 py-1.5 bg-transparent border border-gray-200 dark:border-white/10 rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500"
					/>
				</div>

				<div className="flex-1 overflow-y-auto">
					{loadingAccounts ? (
						<p className="px-4 py-4 text-sm text-gray-400 dark:text-slate-500">Loading…</p>
					) : filteredAccounts.length === 0 ? (
						<p className="px-4 py-4 text-sm text-gray-400 dark:text-slate-500">No accounts found.</p>
					) : (
						filteredAccounts.map((account) => (
							<button
								key={account.id}
								onClick={() => handleSelectAccount(account)}
								className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-white/5 transition-colors ${
									selectedAccount?.id === account.id
										? "bg-indigo-50 dark:bg-indigo-500/10"
										: "hover:bg-gray-50 dark:hover:bg-white/5"
								}`}
							>
								<p className="text-xs font-mono text-gray-500 dark:text-slate-400">{account.account_number}</p>
								<p className="text-sm text-gray-800 dark:text-slate-200 mt-0.5 truncate">{account.name}</p>
							</button>
						))
					)}
				</div>
			</div>

			{/* Main */}
			<div className="flex-1 overflow-y-auto p-8">
				{!selectedAccount ? (
					<div className="flex items-center justify-center h-64">
						<div className="text-center">
							<p className="text-sm text-gray-400 dark:text-slate-500">Select an account to configure dimension rules.</p>
							{loadingDims && (
								<p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Loading dimensions…</p>
							)}
						</div>
					</div>
				) : (
					<RuleEditor
						account={selectedAccount}
						dimsWithValues={dimsWithValues}
						rules={rules}
						loading={loadingRules}
						setRules={setRules}
					/>
				)}
			</div>
		</div>
	);
}
