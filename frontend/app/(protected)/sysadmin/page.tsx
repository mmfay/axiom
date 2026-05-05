"use client";

import { useAuth } from "@/app/provider/AuthProvider";
import ModuleButton from "@/app/components/ModuleButton";

const UsersIcon = (
	<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z" />
	</svg>
);

const RolesIcon = (
	<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
	</svg>
);

export default function SysAdminPage() {

	const { isSysAdmin } = useAuth();

	return (
		<div className="p-8 max-w-4xl">
			<div className="mb-8">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Admin</h1>
				<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage users, roles, and system configuration.</p>
			</div>

			<section className="mb-6">
				<h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Access Control</h2>
				<div className="flex flex-wrap gap-3">
					<ModuleButton
						label="Users"
						description="Create and manage user accounts"
						permission="users.read"
						variant="page"
						href="/sysadmin/users"
						color="indigo"
						icon={UsersIcon}
					/>
					<ModuleButton
						label="Roles"
						description="Define roles and assign permissions"
						permission="roles.read"
						variant="page"
						href="/sysadmin/roles"
						color="violet"
						icon={RolesIcon}
					/>
				</div>
			</section>
		</div>
	);
}
