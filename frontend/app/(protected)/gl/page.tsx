"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/provider/AuthProvider";
import ModuleButton from "@/app/components/ModuleButton";

const AccountsIcon = (
	<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M3 14h18M3 6h18M3 18h18" />
	</svg>
);

const DimensionsIcon = (
	<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 7h.01M7 12h.01M7 17h.01M12 7h5M12 12h5M12 17h5" />
	</svg>
);

const AccountRulesIcon = (
	<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
	</svg>
);

const JournalsIcon = (
	<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
	</svg>
);

export default function GLPage() {

	const { hasPermission, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && !hasPermission("General_ledger.Read")) {
			router.push("/home");
		}
	}, [loading, hasPermission]);

	if (loading) return null;

	return (
		<div className="p-8 max-w-4xl">
			<div className="mb-8">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">General Ledger</h1>
				<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage accounts, dimensions, and journal entries.</p>
			</div>

			<section className="mb-6">
				<h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Setup</h2>
				<div className="flex flex-wrap gap-3">
					<ModuleButton
						label="Chart of Accounts"
						description="Define and manage GL accounts"
						permission="General_ledger.Read"
						variant="page"
						href="/gl/accounts"
						color="emerald"
						icon={AccountsIcon}
					/>
					<ModuleButton
						label="Dimensions"
						description="Configure reporting dimensions"
						permission="General_ledger.Read"
						variant="page"
						href="/gl/dimensions"
						color="violet"
						icon={DimensionsIcon}
					/>
					<ModuleButton
						label="Account Rules"
						description="Validate dimensions against accounts"
						permission="General_ledger.Read"
						variant="page"
						href="/gl/account-rules"
						color="amber"
						icon={AccountRulesIcon}
					/>
				</div>
			</section>

			<section className="mb-6">
				<h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Transactions</h2>
				<div className="flex flex-wrap gap-3">
					<ModuleButton
						label="Journal Entries"
						description="Create and review general journals"
						permission="General_ledger.Read"
						variant="page"
						href="/gl/journals"
						color="indigo"
						icon={JournalsIcon}
					/>
				</div>
			</section>
		</div>
	);
}
