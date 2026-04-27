"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/provider/AuthProvider";

const modules = [
	{ label: "Home", href: "/home" },
];

export default function Navbar() {

	const { user, handleLogout } = useAuth();
	
	const pathname = usePathname();

	return (
		<nav className="sticky top-0 z-50 h-14 flex items-center px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">

		<span className="text-base font-semibold text-gray-900 dark:text-white mr-8">
			Axiom
		</span>

		<div className="flex items-center gap-1 flex-1">
			{modules.map(({ label, href }) => {
			const active = pathname === href || pathname.startsWith(href + "/");
			return (
				<Link
				key={href}
				href={href}
				className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
					active
					? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
					: "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
				}`}
				>
				{label}
				</Link>
			);
			})}
		</div>

		<div className="flex items-center gap-3">
			<button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
			{user?.companies.find(c => c.id === user.company_id)?.name ?? "No Company"}
			<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
			</svg>
			</button>

			<span className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
			{user?.email}
			</span>

			<button
			onClick={handleLogout}
			className="px-3 py-1.5 rounded-md text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
			>
			Sign out
			</button>
		</div>

		</nav>
	);
}
