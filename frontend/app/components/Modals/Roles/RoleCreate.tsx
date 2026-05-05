"use client";

import { useState } from "react";
import { RoleCreate } from "@/app/lib/types/roles";

type Props = {
	onClose: () => void;
	onCreate: (data: RoleCreate) => Promise<unknown>;
};

const empty: RoleCreate = { name: "", description: "" };

export default function RoleCreateModal({ onClose, onCreate }: Props) {
	
	const [form, setForm] = useState<RoleCreate>(empty);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const set = (field: keyof RoleCreate) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
		setForm((prev) => ({ ...prev, [field]: e.target.value }));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			await onCreate({ name: form.name, description: form.description || undefined });
			onClose();
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to create role.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
			<div className="bg-slate-900 border border-white/10 rounded-lg w-full max-w-md p-6 flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-white">Create Role</h2>
					<button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none" aria-label="Close">
						&times;
					</button>
				</div>

				{error && <p className="text-red-400 text-sm">{error}</p>}

				<form onSubmit={handleSubmit} className="flex flex-col gap-3">
					<label className="flex flex-col gap-1">
						<span className="text-xs text-slate-400 uppercase tracking-wide">Name</span>
						<input
							type="text"
							value={form.name}
							onChange={set("name")}
							required
							className="bg-slate-800 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
						/>
					</label>

					<label className="flex flex-col gap-1">
						<span className="text-xs text-slate-400 uppercase tracking-wide">Description</span>
						<textarea
							value={form.description ?? ""}
							onChange={set("description")}
							rows={3}
							className="bg-slate-800 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
						/>
					</label>

					<div className="flex justify-end gap-2 pt-2">
						<button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
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
