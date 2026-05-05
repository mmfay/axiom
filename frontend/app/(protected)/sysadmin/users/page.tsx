"use client";

import { useState } from "react";
import PageHandler from "@/app/components/Tables/PageHandler";
import FilterPanel from "@/app/components/Filters/FilterPanel";
import { useUserController } from "@/app/lib/hooks/useUsersController";
import { useFilterController } from "@/app/lib/hooks/useFilterController";
import { useAuth } from "@/app/provider/AuthProvider";
import UserCreate from "@/app/components/Modals/Users/UserCreate";
import UserEdit from "@/app/components/Modals/Users/UserEdit";
import UserRoles from "@/app/components/Modals/Users/UserRoles";
import { Users } from "@/app/lib/types/users";
import { FILTER_FIELDS_USER } from "@/app/lib/staticData";


export default function UsersPage() {

	const { isSysAdmin } = useAuth();

	const {
		users,
		loading,
		error,
		nextPage,
		prevPage,
		showPrev,
		showNext,
		pageNumber,
		onCreate,
		onUpdate,
		onDelete,
		onGetRoles,
		onAddRole,
		onRemoveRole,
		setItemFiltersState,
		clearFilters,
	} = useUserController();

	const filter = useFilterController(FILTER_FIELDS_USER);

	const [showCreate, setShowCreate] = useState(false);
	const [editUser, setEditUser] = useState<Users | null>(null);
	const [rolesUser, setRolesUser] = useState<Users | null>(null);
	const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

	function handleApply(next: Record<string, string>) {
		filter.onApply(next);
		setItemFiltersState({
			base_fields: Object.entries(next)
				.filter(([, v]) => v)
				.map(([field_id, filter_value]) => ({ field_id, filter_value })),
		});
	}

	function handleClear() {
		filter.onClear();
		clearFilters();
	}

	return (
		<div className="p-8 flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold text-gray-900 dark:text-white">Users</h1>
				<div className="flex items-center gap-2">
					<button
						onClick={filter.onOpen}
						className="relative px-4 py-2 text-sm border border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-md transition-colors"
					>
						Filter
						{filter.activeCount > 0 && (
							<span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-semibold">
								{filter.activeCount}
							</span>
						)}
					</button>
					{isSysAdmin && (
						<button
							onClick={() => setShowCreate(true)}
							className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
						>
							Create User
						</button>
					)}
				</div>
			</div>

			<FilterPanel
				open={filter.open}
				onClose={filter.onClose}
				fields={filter.fields}
				current={filter.filters}
				onApply={handleApply}
				onClear={handleClear}
			/>

			{showCreate && (
				<UserCreate
					onClose={() => setShowCreate(false)}
					onCreate={onCreate}
				/>
			)}

			{editUser && (
				<UserEdit
					user={editUser}
					onClose={() => setEditUser(null)}
					onUpdate={onUpdate}
				/>
			)}

			{rolesUser && (
				<UserRoles
					user={rolesUser}
					onClose={() => setRolesUser(null)}
					onGetRoles={onGetRoles}
					onAddRole={onAddRole}
					onRemoveRole={onRemoveRole}
				/>
			)}

			{error && (
				<p className="text-red-500 text-sm">{error}</p>
			)}

			<PageHandler
				pageLength={users.length}
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
							<th className="px-4 py-3 w-1/2">Email</th>
							<th className="px-4 py-3 w-1/4">User ID</th>
							<th className="px-4 py-3 w-28">Enabled</th>
							{isSysAdmin && <th className="px-4 py-3 w-32" />}
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100 dark:divide-white/5">
						{loading && (
							<tr>
								<td colSpan={isSysAdmin ? 4 : 3} className="px-4 py-6 text-gray-500 dark:text-slate-400">Loading...</td>
							</tr>
						)}
						{!loading && users.length === 0 && (
							<tr>
								<td colSpan={isSysAdmin ? 4 : 3} className="px-4 py-6 text-gray-500 dark:text-slate-400">No users found.</td>
							</tr>
						)}
						{users.map((user) => (
							<tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
								<td className="px-4 py-3">{user.email}</td>
								<td className="px-4 py-3">{user.user_id}</td>
								<td className="px-4 py-3">
									<span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
										user.is_enabled
											? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
											: "bg-gray-100 text-gray-500 dark:bg-slate-500/15 dark:text-slate-400"
									}`}>
										{user.is_enabled ? "Enabled" : "Disabled"}
									</span>
								</td>
								{isSysAdmin && (
									<td className="px-4 py-3">
										{confirmDeleteId === user.id ? (
											<div className="flex items-center justify-end gap-2">
												<span className="text-xs text-gray-500 dark:text-slate-400">Delete?</span>
												<button
													onClick={async () => { await onDelete(user.id); setConfirmDeleteId(null); }}
													className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
												>
													Yes
												</button>
												<button
													onClick={() => setConfirmDeleteId(null)}
													className="text-xs text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
												>
													No
												</button>
											</div>
										) : (
											<div className="flex items-center justify-end gap-3">
												<button
													onClick={() => setRolesUser(user)}
													className="text-xs text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
												>
													Roles
												</button>
												<button
													onClick={() => setEditUser(user)}
													className="text-xs text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
												>
													Edit
												</button>
												<button
													onClick={() => setConfirmDeleteId(user.id)}
													className="text-xs text-gray-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
												>
													Delete
												</button>
											</div>
										)}
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
