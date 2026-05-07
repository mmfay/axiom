"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/provider/AuthProvider";

export default function Navbar() {

	const { user, handleLogout, handleSetActiveRole, handleSetActiveCompany, handleSetDefaultRole, handleSetDefaultCompany, hasPermission, isSysAdmin } = useAuth();
	const pathname = usePathname();
	const [rolesOpen, setRolesOpen] = useState(false);
	const [companiesOpen, setCompaniesOpen] = useState(false);
	const rolesRef = useRef<HTMLDivElement>(null);
	const companiesRef = useRef<HTMLDivElement>(null);

	const pages = [
		{ label: "Home", href: "/home", allowed: true },
		{ label: "General Ledger", href: "/gl", allowed: hasPermission("General_ledger.Read") },
		{ label: "System Admin", href: "/sysadmin", allowed: isSysAdmin },
	].filter(p => p.allowed);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (rolesRef.current && !rolesRef.current.contains(e.target as Node)) {
				setRolesOpen(false);
			}
			if (companiesRef.current && !companiesRef.current.contains(e.target as Node)) {
				setCompaniesOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<nav className="sticky top-0 z-50 h-14 flex items-center px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">

		<span className="text-base font-semibold text-gray-900 dark:text-white mr-8">
			Axiom
		</span>

		<div className="flex items-center gap-1 flex-1">
			{pages.map(({ label, href }) => {
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
			<div ref={companiesRef} className="relative hidden sm:block">
			<button
				onClick={() => setCompaniesOpen(o => !o)}
				className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
			>
				{user?.companies.find(c => c.id === user.company_id)?.name ?? "No Company"}
				<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{companiesOpen && (
				<div className="absolute right-0 mt-1 w-44 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-md py-1">
				{user?.companies.length ? (
					user.companies.map(company => {
					const isActive = company.id === user.company_id;
					const isDefault = company.id === user.default_company_id;
					return (
						<div
						key={company.id}
						className={`flex items-center justify-between px-3 py-1.5 text-sm transition-colors ${
							isActive
							? "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
							: "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
						}`}
						>
						<button
							className="flex-1 text-left"
							onClick={() => {
							handleSetActiveCompany(company.id);
							setCompaniesOpen(false);
							}}
						>
							{company.name}
						</button>
						<div className="flex items-center gap-1.5 shrink-0">
							<button
							title={isDefault ? "Remove default" : "Set as default"}
							onClick={() => handleSetDefaultCompany(isDefault ? null : company.id)}
							className="text-gray-400 hover:text-yellow-400 dark:hover:text-yellow-400 transition-colors"
							>
							{isDefault ? (
								<svg className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
								<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
								</svg>
							) : (
								<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
								</svg>
							)}
							</button>
							{isActive && (
							<svg className="w-3.5 h-3.5 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
							</svg>
							)}
						</div>
						</div>
					);
					})
				) : (
					<div className="px-3 py-1.5 text-sm text-gray-400 dark:text-gray-500">
					No companies
					</div>
				)}
				</div>
			)}
			</div>

			<div ref={rolesRef} className="relative hidden sm:block">
			<button
				onClick={() => setRolesOpen(o => !o)}
				className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
			>
				{user?.active_role?.name ?? "No Role"}
				<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{rolesOpen && (
				<div className="absolute right-0 mt-1 w-48 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-md py-1">
				{user?.roles.length ? (
					user.roles.map(role => {
					const isActive = role.id === user.active_role?.id;
					const isDefault = role.id === user.default_role_id;
					return (
						<div
						key={role.id}
						className={`flex items-center justify-between px-3 py-1.5 text-sm transition-colors ${
							isActive
							? "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
							: "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
						}`}
						>
						<button
							className="flex-1 text-left"
							onClick={() => {
							handleSetActiveRole(role.id);
							setRolesOpen(false);
							}}
						>
							{role.name}
						</button>
						<div className="flex items-center gap-1.5 shrink-0">
							<button
							title={isDefault ? "Remove default" : "Set as default"}
							onClick={() => handleSetDefaultRole(isDefault ? null : role.id)}
							className="text-gray-400 hover:text-yellow-400 dark:hover:text-yellow-400 transition-colors"
							>
							{isDefault ? (
								<svg className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
								<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
								</svg>
							) : (
								<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
								</svg>
							)}
							</button>
							{isActive && (
							<svg className="w-3.5 h-3.5 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
							</svg>
							)}
						</div>
						</div>
					);
					})
				) : (
					<div className="px-3 py-1.5 text-sm text-gray-400 dark:text-gray-500">
					No roles assigned
					</div>
				)}
				</div>
			)}
			</div>

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
