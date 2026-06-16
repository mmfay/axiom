"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/provider/AuthProvider";
import { useNotifications } from "@/app/lib/hooks/useNotifications";

export default function Navbar() {

	const { user, handleLogout, handleSetActiveRole, handleSetActiveCompany, handleSetDefaultRole, handleSetDefaultCompany, hasPermission, isSysAdmin } = useAuth();
	const pathname = usePathname();
	const [rolesOpen, setRolesOpen] = useState(false);
	const [companiesOpen, setCompaniesOpen] = useState(false);
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const rolesRef = useRef<HTMLDivElement>(null);
	const companiesRef = useRef<HTMLDivElement>(null);
	const notificationsRef = useRef<HTMLDivElement>(null);
	const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

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
			if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
				setNotificationsOpen(false);
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

			<div ref={notificationsRef} className="relative">
				<button
					onClick={() => setNotificationsOpen(o => !o)}
					className="relative p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
					title="Notifications"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
					</svg>
					{unreadCount > 0 && (
						<span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-semibold bg-indigo-500 text-white rounded-full">
							{unreadCount > 9 ? "9+" : unreadCount}
						</span>
					)}
				</button>

				{notificationsOpen && (
					<div className="absolute right-0 mt-1 w-80 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-50">
						<div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
							<span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notifications</span>
							{notifications.length > 0 && (
								<button
									onClick={() => { markAllRead(); setNotificationsOpen(false); }}
									className="text-xs text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
								>
									Mark all read
								</button>
							)}
						</div>
						{notifications.length === 0 ? (
							<div className="px-3 py-4 text-sm text-center text-gray-400 dark:text-gray-500">
								No new notifications
							</div>
						) : (
							<ul className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
								{notifications.map(n => {
									const href = n.document_type === "gl_journal" && n.record_id
										? `/gl/journals/${n.record_id}`
										: null;
									const age = (() => {
										const diff = Date.now() - new Date(n.created_at).getTime();
										if (diff < 60_000) return "just now";
										if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
										if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
										return new Date(n.created_at).toLocaleDateString();
									})();
									return (
										<li key={n.id} className="flex items-start gap-2 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
											<div className="flex-1 min-w-0">
												{href ? (
													<Link
														href={href}
														onClick={() => { markRead(n.id); setNotificationsOpen(false); }}
														className="text-sm text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2"
													>
														{n.message}
													</Link>
												) : (
													<p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{n.message}</p>
												)}
												<p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{age}</p>
											</div>
											<button
												onClick={() => markRead(n.id)}
												title="Dismiss"
												className="shrink-0 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors mt-0.5"
											>
												<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</li>
									);
								})}
							</ul>
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
