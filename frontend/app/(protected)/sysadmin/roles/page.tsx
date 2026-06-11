"use client";

import { useState } from "react";
import { useAuth } from "@/app/provider/AuthProvider";
import { useRolesController } from "@/app/lib/hooks/useRolesController";
import { Role } from "@/app/lib/types/roles";
import RoleCreateModal from "@/app/components/Modals/Roles/RoleCreate";
import RoleEditModal from "@/app/components/Modals/Roles/RoleEdit";
import RolePermissionsModal from "@/app/components/Modals/Roles/RolePermissions";
import PageHandler from "@/app/components/Tables/PageHandler";
import ErrorBanner from "@/app/components/ErrorBanner";

export default function RolesPage() {
	
	const { isSysAdmin } = useAuth();
	const {
		roles,
		loading,
		error,
		nextPage,
		prevPage,
		showPrev,
		showNext,
		pageNumber,
		onCreate,
		onUpdate,
		onGetPermissions,
		onAddPermission,
		onRemovePermission,
	} = useRolesController();

	const [showCreate, setShowCreate] = useState(false);
	const [dismissedError, setDismissedError] = useState<string | null>(null);
	const [editRole, setEditRole] = useState<Role | null>(null);
	const [permissionsRole, setPermissionsRole] = useState<Role | null>(null);

	return (
		<div className="p-8 flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold text-gray-900 dark:text-white">Roles</h1>
				{isSysAdmin && (
					<button
						onClick={() => setShowCreate(true)}
						className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
					>
						Create Role
					</button>
				)}
			</div>

			{showCreate && (
				<RoleCreateModal onClose={() => setShowCreate(false)} onCreate={onCreate} />
			)}

			{editRole && (
				<RoleEditModal
					role={editRole}
					onClose={() => setEditRole(null)}
					onUpdate={onUpdate}
				/>
			)}

			{permissionsRole && (
				<RolePermissionsModal
					role={permissionsRole}
					onClose={() => setPermissionsRole(null)}
					onGetPermissions={onGetPermissions}
					onAddPermission={onAddPermission}
					onRemovePermission={onRemovePermission}
				/>
			)}

			{error && error !== dismissedError && (
				<ErrorBanner message={error} onDismiss={() => setDismissedError(error)} />
			)}

			<PageHandler
				pageLength={roles.length}
				prevOnClick={prevPage}
				showPrev={showPrev}
				nextOnClick={nextPage}
				showNext={showNext}
				loading={loading}
				pageNumber={pageNumber}
			/>

			<div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
				<table className="w-full table-fixed text-sm text-left text-gray-800 dark:text-slate-300">
					<thead className="text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
						<tr>
							<th className="px-4 py-3 w-1/3">Name</th>
							<th className="px-4 py-3">Description</th>
							{isSysAdmin && <th className="px-4 py-3 w-32" />}
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100 dark:divide-white/5">
						{loading && (
							<tr>
								<td colSpan={isSysAdmin ? 3 : 2} className="px-4 py-6 text-gray-500 dark:text-slate-400">Loading...</td>
							</tr>
						)}
						{!loading && roles.length === 0 && (
							<tr>
								<td colSpan={isSysAdmin ? 3 : 2} className="px-4 py-6 text-gray-500 dark:text-slate-400">No roles found.</td>
							</tr>
						)}
						{roles.map((role) => (
							<tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
								<td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-200">{role.name}</td>
								<td className="px-4 py-3 text-gray-500 dark:text-slate-400">{role.description ?? "—"}</td>
								{isSysAdmin && (
									<td className="px-4 py-3">
										<div className="flex items-center justify-end gap-3">
											<button
												onClick={() => setPermissionsRole(role)}
												className="text-xs text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
											>
												Permissions
											</button>
											<button
												onClick={() => setEditRole(role)}
												className="text-xs text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
											>
												Edit
											</button>
										</div>
									</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
