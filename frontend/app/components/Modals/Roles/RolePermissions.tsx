"use client";

import { useCallback, useEffect, useState } from "react";
import { Permission, Role, RolePermissionsData } from "@/app/lib/types/roles";

type Props = {
	role: Role;
	onClose: () => void;
	onGetPermissions: (roleId: number) => Promise<RolePermissionsData>;
	onAddPermission: (roleId: number, permissionId: number) => Promise<void>;
	onRemovePermission: (roleId: number, permissionId: number) => Promise<void>;
};

export default function RolePermissionsModal({ role, onClose, onGetPermissions, onAddPermission, onRemovePermission }: Props) {
	
	const [assigned, setAssigned] = useState<Permission[]>([]);
	const [available, setAvailable] = useState<Permission[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [pendingId, setPendingId] = useState<number | null>(null);

	const fetchPermissions = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await onGetPermissions(role.id);
			setAssigned(data.assigned);
			setAvailable(data.available);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to load permissions.");
		} finally {
			setLoading(false);
		}
	}, [role.id, onGetPermissions]);

	useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

	const handleAdd = async (permission: Permission) => {
		setPendingId(permission.id);
		setError(null);
		try {
			await onAddPermission(role.id, permission.id);
			setAssigned((prev) => [...prev, permission].sort((a, b) => a.name.localeCompare(b.name)));
			setAvailable((prev) => prev.filter((p) => p.id !== permission.id));
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to add permission.");
		} finally {
			setPendingId(null);
		}
	};

	const handleRemove = async (permission: Permission) => {
		setPendingId(permission.id);
		setError(null);
		try {
			await onRemovePermission(role.id, permission.id);
			setAvailable((prev) => [...prev, permission].sort((a, b) => a.name.localeCompare(b.name)));
			setAssigned((prev) => prev.filter((p) => p.id !== permission.id));
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to remove permission.");
		} finally {
			setPendingId(null);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
			<div className="bg-slate-900 border border-white/10 rounded-lg w-full max-w-md p-6 flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-semibold text-white">Manage Permissions</h2>
						<p className="text-xs text-slate-400 mt-0.5">{role.name}</p>
					</div>
					<button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none" aria-label="Close">
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
								<p className="text-sm text-slate-500">No permissions assigned.</p>
							) : (
								<ul className="flex flex-col gap-1">
									{assigned.map((p) => (
										<li key={p.id} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-md border border-white/10">
											<div>
												<span className="text-sm text-slate-200">{p.name}</span>
												{p.description && <p className="text-xs text-slate-500">{p.description}</p>}
											</div>
											<button
												onClick={() => handleRemove(p)}
												disabled={pendingId === p.id}
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
								<p className="text-sm text-slate-500">All permissions assigned.</p>
							) : (
								<ul className="flex flex-col gap-1">
									{available.map((p) => (
										<li key={p.id} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-md border border-white/10">
											<div>
												<span className="text-sm text-slate-200">{p.name}</span>
												{p.description && <p className="text-xs text-slate-500">{p.description}</p>}
											</div>
											<button
												onClick={() => handleAdd(p)}
												disabled={pendingId === p.id}
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
					<button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
						Done
					</button>
				</div>
			</div>
		</div>
	);
	
}
