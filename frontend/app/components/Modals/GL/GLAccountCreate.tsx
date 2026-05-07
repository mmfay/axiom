"use client";

import { useState } from "react";
import { GLAccountCreate } from "@/app/lib/types/gl_accounts";

type Props = {
	onClose: () => void;
	onCreate: (data: GLAccountCreate) => Promise<unknown>;
};

const ACCOUNT_TYPES = ["Asset", "Liability", "Equity", "Revenue", "Expense"];

const empty: GLAccountCreate = {
	account_number: "",
	name: "",
	account_type: "Asset",
	normal_balance: "debit",
	description: "",
};

export default function GLAccountCreateModal({ onClose, onCreate }: Props) {

	const [form, setForm] = useState<GLAccountCreate>(empty);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const set = (field: keyof GLAccountCreate) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
		setForm((prev) => ({ ...prev, [field]: e.target.value }));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const payload: GLAccountCreate = { ...form };
			if (!payload.description) delete payload.description;
			await onCreate(payload);
			onClose();
		} catch (err: any) {
			setError(err?.message ?? "Failed to create account.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
			<div className="bg-slate-900 border border-white/10 rounded-lg w-full max-w-md p-6 flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-white">Create Account</h2>
					<button
						onClick={onClose}
						className="text-slate-400 hover:text-white text-xl leading-none"
						aria-label="Close"
					>
						&times;
					</button>
				</div>

				{error && <p className="text-red-400 text-sm">{error}</p>}

				<form onSubmit={handleSubmit} className="flex flex-col gap-3">
					<InputField label="Account Number" type="text" value={form.account_number} onChange={set("account_number")} required />
					<InputField label="Name" type="text" value={form.name} onChange={set("name")} required />

					<label className="flex flex-col gap-1">
						<span className="text-xs text-slate-400 uppercase tracking-wide">Account Type</span>
						<select
							value={form.account_type}
							onChange={set("account_type")}
							required
							className="bg-slate-800 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
						>
							{ACCOUNT_TYPES.map((t) => (
								<option key={t} value={t}>{t}</option>
							))}
						</select>
					</label>

					<label className="flex flex-col gap-1">
						<span className="text-xs text-slate-400 uppercase tracking-wide">Normal Balance</span>
						<select
							value={form.normal_balance}
							onChange={set("normal_balance")}
							required
							className="bg-slate-800 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
						>
							<option value="debit">Debit</option>
							<option value="credit">Credit</option>
						</select>
					</label>

					<label className="flex flex-col gap-1">
						<span className="text-xs text-slate-400 uppercase tracking-wide">Description</span>
						<textarea
							value={form.description ?? ""}
							onChange={set("description")}
							rows={2}
							className="bg-slate-800 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
						/>
					</label>

					<div className="flex justify-end gap-2 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md transition-colors"
						>
							{loading ? "Creating..." : "Create"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

function InputField({
	label,
	type,
	value,
	onChange,
	required,
}: {
	label: string;
	type: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	required?: boolean;
}) {
	return (
		<label className="flex flex-col gap-1">
			<span className="text-xs text-slate-400 uppercase tracking-wide">{label}</span>
			<input
				type={type}
				value={value}
				onChange={onChange}
				required={required}
				className="bg-slate-800 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
			/>
		</label>
	);
}
