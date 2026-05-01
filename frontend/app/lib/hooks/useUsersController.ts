"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createUser, getUsersListPage, updateUsers } from "../api/users";
import { addUserRole, getUserRoles, removeUserRole } from "../api/permissions";
import { UserRolesData, Users, UsersCreate, UsersPatch } from "../types/users";
import { CachedPage, FilterSet } from "../types/data";

export type UsersController = {
	pages: CachedPage<Users>[];
	currentPage: CachedPage<Users> | undefined;
	users: Users[];
	loading: boolean;
	error: string | null;
	reload: () => Promise<void>;
	nextPage: () => Promise<void>;
	prevPage: () => void;
	showPrev: boolean;
	showNext: boolean;
	pageNumber: number;
	onUpdate: (recID: number, patch: UsersPatch) => Promise<Users>;
	onCreate: (data: UsersCreate) => Promise<Users>;
	onGetRoles: (userId: number) => Promise<UserRolesData>;
	onAddRole: (userId: number, roleId: number) => Promise<void>;
	onRemoveRole: (userId: number, roleId: number) => Promise<void>;

	// filters
	itemFilters: FilterSet;
	setItemFiltersState: (filters: FilterSet) => void;
	clearFilters: () => void;
}
export function useUserController(): UsersController {

	const [pages, setPages] = useState<CachedPage<Users>[]>([]);
	const [pageIndex, setPageIndex] = useState(0);

	const [itemFilters, setItemFilters] = useState<FilterSet>({base_fields: []});
	
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const currentPage = pages[pageIndex];
	const users = currentPage?.items ?? [];
	const pageNumber = currentPage?.page_number ?? 1;

	const showPrev = pageIndex > 0;
	const showNext = Boolean(currentPage?.has_more);

	// Tracks whether the component using this hook is still mounted
	// Used to prevent calling setState after unmount when async requests resolve late
	const aliveRef = useRef(true); 

	useEffect(() => {
		aliveRef.current = true;
		return () => {
			aliveRef.current = false;			
		}
	}, []);

	// gets new data
	const reload = useCallback(async (filters?: FilterSet) => {

		const activeFilters = filters ?? itemFilters;
	
		setLoading(true);
		setError(null);

		try {
			const res = await getUsersListPage();

			if (!res.ok || !res.data) {
				setError(res.message);
				return;
			}

			const page = res.data;

			if (!aliveRef.current) return;
			setPages([
				{
					page_number: 1,
					items: page.items,
					next_cursor: page.next_cursor ?? null,
					has_more: page.has_more,
				}
			]);
			setPageIndex(0);
		} catch (e: any) {
			if (!aliveRef.current) return;
			setError(e?.message ?? "Failed to load custom fields");
			throw e;
		} finally {
			if (!aliveRef.current) return;
			setLoading(false);
		}

	}, []);

	useEffect(() => {
		reload();
	}, [reload]);

	// gets new data
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
			const res = await getUsersListPage(currentPage.next_cursor ?? undefined);

			if (!res.ok || !res.data) {
				setError(res.message);
				return;
			}

			const page = res.data;

			if (!aliveRef.current) return;
			const newPage: CachedPage<Users> = {
				page_number: currentPage.page_number + 1,
				items: page.items,
				next_cursor: page.next_cursor ?? null,
				has_more: page.has_more,
			};
			setPages((prev) => [...prev, newPage]);
			setPageIndex((i) => i + 1);
		} catch (e: any) {
			setError(e?.message ?? "Failed to load next page");
			console.error(e);
		} finally {
			setLoading(false);
		}

	}, [currentPage, pages, pageIndex]);

	// gets new data
	const prevPage = useCallback(() => {
		setPageIndex((i) => Math.max(0, i - 1));
	}, []);

	// sets a filter state 
	const setItemFiltersState = useCallback(
		async (filters: FilterSet) => {
			setItemFilters(filters);
			setPages([]);
			setPageIndex(0);

			await reload(filters);
		}, 
		[reload]
	);

	const clearFilters = useCallback(
		async () => {
			setItemFilters({base_fields: []});
			setPages([]);
			setPageIndex(0);
			
			await reload();
		}
		,[reload]
	);

	// updates an item 
	const onUpdate = useCallback(
		async (recID: number, patch: UsersPatch): Promise<Users> => {

			if (!patch || Object.keys(patch).length === 0) {
				throw new Error("No fields provided to update.");
			}

			setError(null);

			const res = await updateUsers(recID, patch);

			if (!res.ok || !res.data) {
				throw new Error(res.message ?? "Failed to update user");
			}

			const updated = res.data;

			// Update cached pages
			setPages((prev) =>
				prev.map((p) => ({
					...p,
					items: p.items.map((it) => (it.id === recID ? updated : it)),
				}))
			);

			return updated;
		},
		[]
	);

	const onCreate = useCallback(

		async (data: UsersCreate): Promise<Users> => {
			setError(null);

			const res = await createUser(data);

			if (!res.ok || !res.data) {
				throw new Error(res.message ?? "Failed to create user");
			}

			await reload();

			return res.data;
		},

		[reload]
		
	);

	const onGetRoles = useCallback(async (userId: number): Promise<UserRolesData> => {
		const res = await getUserRoles(userId);
		if (!res.ok || !res.data) throw new Error(res.message ?? "Failed to fetch roles");
		return res.data;
	}, []);

	const onAddRole = useCallback(async (userId: number, roleId: number): Promise<void> => {
		const res = await addUserRole(userId, roleId);
		if (!res.ok) throw new Error(res.message ?? "Failed to add role");
	}, []);

	const onRemoveRole = useCallback(async (userId: number, roleId: number): Promise<void> => {
		const res = await removeUserRole(userId, roleId);
		if (!res.ok) throw new Error(res.message ?? "Failed to remove role");
	}, []);

	// make accessible outside of controller
	return {
		pages,
		currentPage,
		users,
		loading,
		error,
		reload, 
		nextPage,
		prevPage,
		showPrev,
		showNext,
		pageNumber,
		onUpdate,
		onCreate,
		onGetRoles,
		onAddRole,
		onRemoveRole,
		itemFilters,
		setItemFiltersState,
		clearFilters
	};
}