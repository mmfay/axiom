"use client";

import { useState } from "react";
import { GLAccount, GLAccountPatch } from "@/app/lib/types/gl_accounts";

type Props = {
	account: GLAccount;
	onClose: () => void;
	onUpdate: (accountId: number, patch: GLAccountPatch) => Promise<GLAccount>;
};

export default function GLAccountEditModal({ account, onClose, onUpdate }: Props) {

	const [name, setName] = useState(account.name);
	const [description, setDescription] = useState(account.description ?? "");
	const [isActive, setIsActive] = useState(account.is_active);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const patch: GLAccountPatch = {};
		if (name !== account.name) patch.name = name;
		if (description !== (account.description ?? "")) patch.description = description || undefined;
		if (isActive !== account.is_active) patch.is_active = isActive;

		if (Object.keys(patch).length === 0) {
			onClose();
			return;
		}

		try {
			await onUpdate(account.id, patch);
			onClose();
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to update account.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
			<div className="bg-slate-900 border border-white/10 rounded-lg w-full max-w-md p-6 flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-semibold text-white">Edit Account</h2>
						<p className="text-xs text-slate-400 mt-0.5 font-mono">{account.account_number}</p>
					</div>
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
					<label className="flex flex-col gap-1">
						<span className="text-xs text-slate-400 uppercase tracking-wide">Name</span>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							className="bg-slate-800 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
						/>
					</label>

					<label className="flex flex-col gap-1">
						<span className="text-xs text-slate-400 uppercase tracking-wide">Description</span>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={2}
							className="bg-slate-800 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
						/>
					</label>

					<div className="flex items-center justify-between px-3 py-2 bg-slate-800 border border-white/10 rounded-md">
						<span className="text-sm text-slate-300">Active</span>
						<button
							type="button"
							onClick={() => setIsActive((v) => !v)}
							className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
								isActive ? "bg-indigo-600" : "bg-slate-600"
							}`}
						>
							<span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
								isActive ? "translate-x-4" : "translate-x-0"
							}`} />
						</button>
					</div>

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
							{loading ? "Saving..." : "Save"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
