"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createRole, getRolesListPage, getRolePermissions, addRolePermission, removeRolePermission, updateRole } from "../api/permissions";
import { Role, RoleCreate, RolePatch, RolePermissionsData } from "../types/roles";
import { CachedPage } from "../types/data";
import { ApiResponse } from "../api/response";

export type RolesController = {
	pages: CachedPage<Role>[];
	currentPage: CachedPage<Role> | undefined;
	roles: Role[];
	loading: boolean;
	error: string | null;
	reload: () => Promise<void>;
	nextPage: () => Promise<void>;
	prevPage: () => void;
	showPrev: boolean;
	showNext: boolean;
	pageNumber: number;
	onCreate: (data: RoleCreate) => Promise<Role>;
	onUpdate: (roleId: number, patch: RolePatch) => Promise<Role>;
	onGetPermissions: (roleId: number) => Promise<RolePermissionsData>;
	onAddPermission: (roleId: number, permissionId: number) => Promise<void>;
	onRemovePermission: (roleId: number, permissionId: number) => Promise<void>;
};

export function useRolesController(): RolesController {
	const [pages, setPages] = useState<CachedPage<Role>[]>([]);
	const [pageIndex, setPageIndex] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const currentPage = pages[pageIndex];
	const roles = currentPage?.items ?? [];
	const pageNumber = currentPage?.page_number ?? 1;
	const showPrev = pageIndex > 0;
	const showNext = Boolean(currentPage?.has_more);

	const aliveRef = useRef(true);

	useEffect(() => {
		aliveRef.current = true;
		return () => { aliveRef.current = false; };
	}, []);

	const reload = useCallback(async () => {

		setLoading(true);
		setError(null);

		try {

			const res = ApiResponse.handle(await getRolesListPage());

			if (!res.ok || !res.data) {
				setError(res.message);
				return;
			}

			const page = res.data;

			if (!aliveRef.current) return;

			setPages([{
				page_number: 1,
				items: page.items,
				next_cursor: page.next_cursor ?? null,
				has_more: page.has_more,
			}]);

			setPageIndex(0);

		} catch (e: unknown) {

			if (!aliveRef.current) return;
			setError(e instanceof Error ? e.message : "Failed to load roles");
			throw e;

		} finally {

			if (!aliveRef.current) return;
			setLoading(false);

		}

	}, []);

	useEffect(() => { reload(); }, [reload]);

	const nextPage = useCallback(async () => {

		if (!currentPage) return;
		if (!currentPage.has_more) return;

		if (pages[pageIndex + 1]) {
			setPageIndex((i) => i + 1);
			return;
		}

		if (!currentPage.next_cursor) return;

		setLoading(true);
		setError(null);

		try {

			const res = ApiResponse.handle(await getRolesListPage(currentPage.next_cursor ?? undefined));

			if (!res.ok || !res.data) {
				setError(res.message);
				return;
			}

			const page = res.data;

			if (!aliveRef.current) return;

			const newPage: CachedPage<Role> = {
				page_number: currentPage.page_number + 1,
				items: page.items,
				next_cursor: page.next_cursor ?? null,
				has_more: page.has_more,
			};

			setPages((prev) => [...prev, newPage]);
			setPageIndex((i) => i + 1);

		} catch (e: unknown) {

			setError(e instanceof Error ? e.message : "Failed to load next page");

		} finally {

			setLoading(false);

		}

	}, [currentPage, pages, pageIndex]);

	const prevPage = useCallback(() => {

		setPageIndex((i) => Math.max(0, i - 1));

	}, []);

	const onUpdate = useCallback(async (roleId: number, patch: RolePatch): Promise<Role> => {
		if (!patch || Object.keys(patch).length === 0) throw new Error("No fields provided to update.");
		setError(null);
		const res = ApiResponse.handle(await updateRole(roleId, patch));
		if (!res.ok || !res.data) throw new Error(res.message ?? "Failed to update role");
		const updated = res.data;
		setPages((prev) =>
			prev.map((p) => ({
				...p,
				items: p.items.map((it) => (it.id === roleId ? updated : it)),
			}))
		);
		return updated;
	}, []);

	const onCreate = useCallback(async (data: RoleCreate): Promise<Role> => {
		setError(null);
		const res = ApiResponse.handle(await createRole(data));
		if (!res.ok || !res.data) throw new Error(res.message ?? "Failed to create role");
		await reload();
		return res.data;
	}, [reload]);

	const onGetPermissions = useCallback(async (roleId: number): Promise<RolePermissionsData> => {
		const res = ApiResponse.handle(await getRolePermissions(roleId));
		if (!res.ok || !res.data) throw new Error(res.message ?? "Failed to fetch permissions");
		return res.data;
	}, []);

	const onAddPermission = useCallback(async (roleId: number, permissionId: number): Promise<void> => {
		const res = ApiResponse.handle(await addRolePermission(roleId, permissionId));
		if (!res.ok) throw new Error(res.message ?? "Failed to add permission");
	}, []);

	const onRemovePermission = useCallback(async (roleId: number, permissionId: number): Promise<void> => {
		const res = ApiResponse.handle(await removeRolePermission(roleId, permissionId));
		if (!res.ok) throw new Error(res.message ?? "Failed to remove permission");
	}, []);

	return {
		pages,
		currentPage,
		roles,
		loading,
		error,
		reload,
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
	};
}
