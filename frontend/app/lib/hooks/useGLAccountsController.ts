"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getGLAccountsListPage, createGLAccount, updateGLAccount } from "../api/gl_accounts";
import { GLAccount, GLAccountCreate, GLAccountPatch } from "../types/gl_accounts";
import { CachedPage, FilterSet } from "../types/data";
import { ApiResponse } from "../api/response";

export type GLAccountsController = {
	pages: CachedPage<GLAccount>[];
	currentPage: CachedPage<GLAccount> | undefined;
	accounts: GLAccount[];
	loading: boolean;
	error: string | null;
	reload: () => Promise<void>;
	nextPage: () => Promise<void>;
	prevPage: () => void;
	showPrev: boolean;
	showNext: boolean;
	pageNumber: number;
	onCreate: (data: GLAccountCreate) => Promise<GLAccount>;
	onUpdate: (accountId: number, patch: GLAccountPatch) => Promise<GLAccount>;
	itemFilters: FilterSet;
	setItemFiltersState: (filters: FilterSet) => void;
	clearFilters: () => void;
};

export function useGLAccountsController(): GLAccountsController {

	const [pages, setPages] = useState<CachedPage<GLAccount>[]>([]);
	const [pageIndex, setPageIndex] = useState(0);
	const [itemFilters, setItemFilters] = useState<FilterSet>({ base_fields: [] });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const currentPage = pages[pageIndex];
	const accounts = currentPage?.items ?? [];
	const pageNumber = currentPage?.page_number ?? 1;
	const showPrev = pageIndex > 0;
	const showNext = Boolean(currentPage?.has_more);

	const aliveRef = useRef(true);

	useEffect(() => {
		aliveRef.current = true;
		return () => { aliveRef.current = false; };
	}, []);

	const reload = useCallback(async (filters?: FilterSet) => {

		const activeFilters = filters ?? itemFilters;

		setLoading(true);
		setError(null);

		try {

			const res = ApiResponse.handle(await getGLAccountsListPage(activeFilters));

			if (!res.ok || !res.data) {
				setError(res.message);
				return;
			}

			if (!aliveRef.current) return;

			setPages([{
				page_number: 1,
				items: res.data.items,
				next_cursor: res.data.next_cursor ?? null,
				has_more: res.data.has_more,
			}]);

			setPageIndex(0);

		} catch (e: unknown) {
			if (!aliveRef.current) return;
			setError(e instanceof Error ? e.message : "Failed to load accounts");
			throw e;
		} finally {
			if (!aliveRef.current) return;
			setLoading(false);
		}

	}, []);

	useEffect(() => { reload(); }, [reload]);

	const nextPage = useCallback(async () => {

		if (!currentPage?.has_more || !currentPage.next_cursor) return;

		if (pages[pageIndex + 1]) {
			setPageIndex((i) => i + 1);
			return;
		}

		setLoading(true);
		setError(null);

		try {

			const res = ApiResponse.handle(await getGLAccountsListPage(itemFilters, currentPage.next_cursor));

			if (!res.ok || !res.data) {
				setError(res.message);
				return;
			}

			if (!aliveRef.current) return;

			setPages((prev) => [...prev, {
				page_number: currentPage.page_number + 1,
				items: res.data!.items,
				next_cursor: res.data!.next_cursor ?? null,
				has_more: res.data!.has_more,
			}]);

			setPageIndex((i) => i + 1);

		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Failed to load next page");
		} finally {
			setLoading(false);
		}

	}, [currentPage, pages, pageIndex, itemFilters]);

	const prevPage = useCallback(() => {
		setPageIndex((i) => Math.max(0, i - 1));
	}, []);

	const setItemFiltersState = useCallback(async (filters: FilterSet) => {
		setItemFilters(filters);
		setPages([]);
		setPageIndex(0);
		await reload(filters);
	}, [reload]);

	const clearFilters = useCallback(async () => {
		setItemFilters({ base_fields: [] });
		setPages([]);
		setPageIndex(0);
		await reload({ base_fields: [] });
	}, [reload]);

	const onCreate = useCallback(async (data: GLAccountCreate): Promise<GLAccount> => {

		setError(null);

		const res = ApiResponse.handle(await createGLAccount(data));

		if (!res.ok || !res.data) throw new Error(res.message ?? "Failed to create account");

		await reload();

		return res.data;

	}, [reload]);

	const onUpdate = useCallback(async (accountId: number, patch: GLAccountPatch): Promise<GLAccount> => {

		if (!patch || Object.keys(patch).length === 0) throw new Error("No fields provided to update.");

		setError(null);

		const res = ApiResponse.handle(await updateGLAccount(accountId, patch));

		if (!res.ok || !res.data) throw new Error(res.message ?? "Failed to update account");

		const updated = res.data;

		setPages((prev) =>
			prev.map((p) => ({
				...p,
				items: p.items.map((it) => (it.id === accountId ? updated : it)),
			}))
		);

		return updated;

	}, []);

	return {
		pages,
		currentPage,
		accounts,
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
		itemFilters,
		setItemFiltersState,
		clearFilters,
	};
}
