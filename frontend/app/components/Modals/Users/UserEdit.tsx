"use client";

import { useState } from "react";
import { Users, UsersPatch } from "@/app/lib/types/users";

type Props = {
	user: Users;
	onClose: () => void;
	onUpdate: (recID: number, patch: UsersPatch) => Promise<Users>;
};

export default function UserEdit({ user, onClose, onUpdate }: Props) {
	
	const [email, setEmail] = useState(user.email);
	const [isEnabled, setIsEnabled] = useState(user.is_enabled);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const patch: UsersPatch = {};
		if (email !== user.email) patch.email = email;
		if (isEnabled !== user.is_enabled) patch.is_enabled = isEnabled;

		if (Object.keys(patch).length === 0) {
			onClose();
			return;
		}

		try {
			await onUpdate(user.id, patch);
			onClose();
		} catch (err: any) {
			setError(err?.message ?? "Failed to update user.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
			<div className="bg-slate-900 border border-white/10 rounded-lg w-full max-w-md p-6 flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-white">Edit User</h2>
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
						<span className="text-xs text-slate-400 uppercase tracking-wide">User ID</span>
						<p className="px-3 py-2 text-sm text-slate-400 bg-slate-800/50 border border-white/5 rounded-md">{user.user_id}</p>
					</label>

					<label className="flex flex-col gap-1">
						<span className="text-xs text-slate-400 uppercase tracking-wide">Email</span>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="bg-slate-800 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
						/>
					</label>

					<div className="flex items-center justify-between px-3 py-2 bg-slate-800 border border-white/10 rounded-md">
						<span className="text-sm text-slate-300">Enabled</span>
						<button
							type="button"
							onClick={() => setIsEnabled((v) => !v)}
							className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
								isEnabled ? "bg-indigo-600" : "bg-slate-600"
							}`}
						>
							<span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
								isEnabled ? "translate-x-4" : "translate-x-0"
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
