"use client";

import { useState } from "react";
import { UsersCreate } from "@/app/lib/types/users";

type Props = {
	onClose: () => void;
	onCreate: (data: UsersCreate) => Promise<unknown>;
};

const empty: UsersCreate = {
	email: "",
	user_id: "",
	password: "",
};

export default function UserCreate({ onClose, onCreate }: Props) {
	
	const [form, setForm] = useState<UsersCreate>(empty);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const set = (field: keyof UsersCreate) => (e: React.ChangeEvent<HTMLInputElement>) =>
		setForm((prev) => ({ ...prev, [field]: e.target.value }));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			await onCreate(form);
			onClose();
		} catch (err: any) {
			setError(err?.message ?? "Failed to create user.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
			<div className="bg-slate-900 border border-white/10 rounded-lg w-full max-w-md p-6 flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-white">Create User</h2>
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
					<Field label="Email" type="email" value={form.email} onChange={set("email")} required />
					<Field label="User ID" type="text" value={form.user_id} onChange={set("user_id")} required />
					<Field label="Password" type="password" value={form.password} onChange={set("password")} required />

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

function Field({
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
