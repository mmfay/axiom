"use client";

import { useEffect, useRef, useState } from "react";
import { useGLDimensionsController } from "@/app/lib/hooks/useGLDimensionsController";
import { GLDimension, GLDimensionCreate, GLDimensionPatch, GLDimensionValue, GLDimensionValueCreate } from "@/app/lib/types/gl_dimensions";
import { getGLDimensionValues, createGLDimensionValue, updateGLDimensionValue } from "@/app/lib/api/gl_dimensions";
import { ApiResponse } from "@/app/lib/api/response";

const SLOTS = [1, 2, 3, 4, 5] as const;

// ─── Values panel ────────────────────────────────────────────────────────────

type ValueRowProps = {
	value: GLDimensionValue;
	onToggle: (id: number, isActive: boolean) => void;
};

function ValueRow({ value, onToggle }: ValueRowProps) {
	return (
		<div className="flex items-center gap-3 px-4 py-2">
			<span className="font-mono text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 flex-shrink-0">
				{value.code}
			</span>
			<span className={`flex-1 text-sm ${
				value.is_active
					? "text-gray-800 dark:text-slate-200"
					: "text-gray-400 dark:text-slate-500 line-through"
			}`}>
				{value.name}
			</span>
			<button
				onClick={() => onToggle(value.id, !value.is_active)}
				className="text-xs text-gray-400 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors flex-shrink-0"
			>
				{value.is_active ? "Deactivate" : "Activate"}
			</button>
		</div>
	);
}

type DimensionValuesPanelProps = {
	dimension: GLDimension;
};

function DimensionValuesPanel({ dimension }: DimensionValuesPanelProps) {

	const [values, setValues] = useState<GLDimensionValue[]>([]);
	const [loading, setLoading] = useState(true);
	const [newCode, setNewCode] = useState("");
	const [newName, setNewName] = useState("");
	const [adding, setAdding] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const nameInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		getGLDimensionValues(dimension.id)
			.then((res) => {
				const r = ApiResponse.handle(res);
				if (r.ok && r.data) setValues(r.data);
			})
			.finally(() => setLoading(false));
	}, [dimension.id]);

	async function handleAdd() {
		if (!newCode.trim() || !newName.trim() || adding) return;
		setError(null);
		setAdding(true);
		try {
			const body: GLDimensionValueCreate = { code: newCode.trim(), name: newName.trim() };
			const res = ApiResponse.handle(await createGLDimensionValue(dimension.id, body));
			if (!res.ok || !res.data) throw new Error(res.message ?? "Failed to add value");
			setValues((prev) => [...prev, res.data!]);
			setNewCode("");
			setNewName("");
			nameInputRef.current?.focus();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to add value");
		} finally {
			setAdding(false);
		}
	}

	async function handleToggleValue(valueId: number, isActive: boolean) {
		const res = ApiResponse.handle(await updateGLDimensionValue(dimension.id, valueId, { is_active: isActive }));
		if (res.ok && res.data) {
			setValues((prev) => prev.map((v) => (v.id === valueId ? res.data! : v)));
		}
	}

	return (
		<div className="border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
			{loading ? (
				<p className="px-4 py-3 text-xs text-gray-400 dark:text-slate-500">Loading...</p>
			) : (
				<>
					{values.length === 0 ? (
						<p className="px-4 py-3 text-xs text-gray-400 dark:text-slate-500">No values yet. Add one below.</p>
					) : (
						<div className="divide-y divide-gray-100 dark:divide-white/5 py-1">
							{values.map((v) => (
								<ValueRow key={v.id} value={v} onToggle={handleToggleValue} />
							))}
						</div>
					)}

					<div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 dark:border-white/5">
						<input
							type="text"
							value={newCode}
							onChange={(e) => setNewCode(e.target.value)}
							onKeyDown={(e) => { if (e.key === "Tab" && newCode.trim()) e.preventDefault(), nameInputRef.current?.focus(); }}
							placeholder="Code"
							maxLength={20}
							className="w-24 text-sm px-3 py-1.5 bg-transparent border border-gray-200 dark:border-white/10 rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500"
						/>
						<input
							ref={nameInputRef}
							type="text"
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
							placeholder="Name"
							className="flex-1 text-sm px-3 py-1.5 bg-transparent border border-gray-200 dark:border-white/10 rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500"
						/>
						<button
							onClick={handleAdd}
							disabled={adding || !newCode.trim() || !newName.trim()}
							className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors disabled:opacity-50"
						>
							Add
						</button>
					</div>

					{error && <p className="px-4 pb-3 text-xs text-red-500 dark:text-red-400">{error}</p>}
				</>
			)}
		</div>
	);
}

// ─── Dimension row ────────────────────────────────────────────────────────────

type DimensionRowProps = {
	slot: number;
	dimension: GLDimension | undefined;
	onCreate: (data: GLDimensionCreate) => Promise<GLDimension>;
	onUpdate: (id: number, patch: GLDimensionPatch) => Promise<GLDimension>;
};

function DimensionRow({ slot, dimension, onCreate, onUpdate }: DimensionRowProps) {

	const [name, setName] = useState(dimension?.name ?? "");
	const [saving, setSaving] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const [rowError, setRowError] = useState<string | null>(null);

	const dimNameRef = useRef(dimension?.name);
	useEffect(() => {
		if (dimension?.name !== dimNameRef.current) {
			setName(dimension?.name ?? "");
			dimNameRef.current = dimension?.name;
		}
	}, [dimension?.name]);

	const isActive = dimension?.is_active ?? false;
	const isDirty = name.trim() !== (dimension?.name ?? "");

	useEffect(() => {
		if (!isActive) setExpanded(false);
	}, [isActive]);

	async function handleToggle() {
		if (saving) return;
		setRowError(null);
		setSaving(true);
		try {
			if (!dimension) {
				if (!name.trim()) { setRowError("Enter a name to enable this dimension"); return; }
				await onCreate({ slot, name: name.trim(), is_active: true });
			} else {
				await onUpdate(dimension.id, { is_active: !isActive });
			}
		} catch (e) {
			setRowError(e instanceof Error ? e.message : "Failed to update");
		} finally {
			setSaving(false);
		}
	}

	async function handleSaveName() {
		if (saving || !name.trim()) return;
		setRowError(null);
		setSaving(true);
		try {
			if (!dimension) {
				await onCreate({ slot, name: name.trim(), is_active: false });
			} else {
				await onUpdate(dimension.id, { name: name.trim() });
			}
		} catch (e) {
			setRowError(e instanceof Error ? e.message : "Failed to save");
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="border-b last:border-b-0 border-gray-100 dark:border-white/5">
			<div className="flex items-center gap-4 px-4 py-4">
				<div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-md bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold">
					D{slot}
				</div>

				<div className="flex-1 flex items-center gap-2">
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						onKeyDown={(e) => { if (e.key === "Enter" && isDirty) handleSaveName(); }}
						placeholder="Label this dimension..."
						disabled={saving}
						className="flex-1 text-sm px-3 py-1.5 bg-transparent border border-gray-200 dark:border-white/10 rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 disabled:opacity-50 transition-colors"
					/>
					{isDirty && (
						<button
							onClick={handleSaveName}
							disabled={saving || !name.trim()}
							className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors disabled:opacity-50"
						>
							Save
						</button>
					)}
				</div>

				{isActive && (
					<button
						onClick={() => setExpanded((e) => !e)}
						className="flex-shrink-0 p-1.5 rounded text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
						aria-label={expanded ? "Collapse values" : "Expand values"}
					>
						<svg
							className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
							fill="none" stroke="currentColor" viewBox="0 0 24 24"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
						</svg>
					</button>
				)}

				<div className="flex items-center gap-2 flex-shrink-0">
					<span className="text-xs text-gray-400 dark:text-slate-500 w-12 text-right">
						{isActive ? "Active" : "Inactive"}
					</span>
					<button
						onClick={handleToggle}
						disabled={saving}
						aria-label={isActive ? "Disable dimension" : "Enable dimension"}
						className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
							isActive ? "bg-indigo-600" : "bg-gray-200 dark:bg-white/10"
						}`}
					>
						<span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
							isActive ? "translate-x-5" : "translate-x-0.5"
						}`} />
					</button>
				</div>
			</div>

			{rowError && (
				<p className="px-4 pb-3 text-xs text-red-500 dark:text-red-400">{rowError}</p>
			)}

			{isActive && expanded && dimension && (
				<DimensionValuesPanel dimension={dimension} />
			)}
		</div>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GLDimensionsPage() {

	const { dimensions, loading, error, onCreate, onUpdate } = useGLDimensionsController();

	const dimBySlot = Object.fromEntries(dimensions.map((d) => [d.slot, d]));

	return (
		<div className="p-8 flex flex-col gap-6">
			<div>
				<h1 className="text-xl font-semibold text-gray-900 dark:text-white">Dimensions</h1>
				<p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
					Enable and label up to 5 reporting dimensions for this company.
				</p>
			</div>

			{error && <p className="text-sm text-red-500">{error}</p>}

			<div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
				{loading ? (
					<div className="px-4 py-6 text-sm text-gray-500 dark:text-slate-400">Loading...</div>
				) : (
					SLOTS.map((slot) => (
						<DimensionRow
							key={`${slot}-${dimBySlot[slot]?.id ?? "new"}`}
							slot={slot}
							dimension={dimBySlot[slot]}
							onCreate={onCreate}
							onUpdate={onUpdate}
						/>
					))
				)}
			</div>
		</div>
	);
}
