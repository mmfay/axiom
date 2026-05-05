"use client";

import { useCallback, useEffect, useState } from "react";
import { UserRole, UserRolesData, Users } from "@/app/lib/types/users";

type Props = {
	user: Users;
	onClose: () => void;
	onGetRoles: (userId: number) => Promise<UserRolesData>;
	onAddRole: (userId: number, roleId: number) => Promise<void>;
	onRemoveRole: (userId: number, roleId: number) => Promise<void>;
};

export default function UserRoles({ user, onClose, onGetRoles, onAddRole, onRemoveRole }: Props) {
	
	const [assigned, setAssigned] = useState<UserRole[]>([]);
	const [available, setAvailable] = useState<UserRole[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [pendingId, setPendingId] = useState<number | null>(null);

	const fetchRoles = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await onGetRoles(user.id);
			setAssigned(data.assigned);
			setAvailable(data.available);
		} catch (err: any) {
			setError(err?.message ?? "Failed to load roles.");
		} finally {
			setLoading(false);
		}
	}, [user.id, onGetRoles]);

	useEffect(() => {
		fetchRoles();
	}, [fetchRoles]);

	const handleAdd = async (role: UserRole) => {
		setPendingId(role.id);
		setError(null);
		try {
			await onAddRole(user.id, role.id);
			setAssigned((prev) => [...prev, role].sort((a, b) => a.name.localeCompare(b.name)));
			setAvailable((prev) => prev.filter((r) => r.id !== role.id));
		} catch (err: any) {
			setError(err?.message ?? "Failed to add role.");
		} finally {
			setPendingId(null);
		}
	};

	const handleRemove = async (role: UserRole) => {
		setPendingId(role.id);
		setError(null);
		try {
			await onRemoveRole(user.id, role.id);
			setAvailable((prev) => [...prev, role].sort((a, b) => a.name.localeCompare(b.name)));
			setAssigned((prev) => prev.filter((r) => r.id !== role.id));
		} catch (err: any) {
			setError(err?.message ?? "Failed to remove role.");
		} finally {
			setPendingId(null);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
			<div className="bg-slate-900 border border-white/10 rounded-lg w-full max-w-md p-6 flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-semibold text-white">Manage Roles</h2>
						<p className="text-xs text-slate-400 mt-0.5">{user.user_id}</p>
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

				{loading ? (
					<p className="text-slate-400 text-sm py-4">Loading...</p>
				) : (
					<div className="flex flex-col gap-4">
						<section className="flex flex-col gap-2">
							<h3 className="text-xs uppercase tracking-wider text-slate-400">Assigned</h3>
							{assigned.length === 0 ? (
								<p className="text-sm text-slate-500">No roles assigned.</p>
							) : (
								<ul className="flex flex-col gap-1">
									{assigned.map((role) => (
										<li key={role.id} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-md border border-white/10">
											<span className="text-sm text-slate-200">{role.name}</span>
											<button
												onClick={() => handleRemove(role)}
												disabled={pendingId === role.id}
												className="text-xs text-slate-400 hover:text-red-400 disabled:opacity-40 transition-colors"
											>
												Remove
											</button>
										</li>
									))}
								</ul>
							)}
						</section>

						<section className="flex flex-col gap-2">
							<h3 className="text-xs uppercase tracking-wider text-slate-400">Available</h3>
							{available.length === 0 ? (
								<p className="text-sm text-slate-500">All roles assigned.</p>
							) : (
								<ul className="flex flex-col gap-1">
									{available.map((role) => (
										<li key={role.id} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-md border border-white/10">
											<span className="text-sm text-slate-200">{role.name}</span>
											<button
												onClick={() => handleAdd(role)}
												disabled={pendingId === role.id}
												className="text-xs text-slate-400 hover:text-indigo-400 disabled:opacity-40 transition-colors"
											>
												Add
											</button>
										</li>
									))}
								</ul>
							)}
						</section>
					</div>
				)}

				<div className="flex justify-end pt-2">
					<button
						onClick={onClose}
						className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
					>
						Done
					</button>
				</div>
			</div>
		</div>
	);
}
