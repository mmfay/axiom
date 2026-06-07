"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CachedPage, FilterSet } from "../types/data";
import { ApiResponse } from "../api/response";
import { getGLJournalsListPage } from "../api/gl_journals";
import { GLJournal } from "../types/gl_journals";

export type GLJournalController = {
	pages: CachedPage<GLJournal>[];
	currentPage: CachedPage<GLJournal> | undefined;
	journals: GLJournal[];
	loading: boolean;
	error: string | null;
	reload: () => Promise<void>;
	nextPage: () => Promise<void>;
	prevPage: () => void;
	showPrev: boolean;
	showNext: boolean;
	pageNumber: number;
	itemFilters: FilterSet;
	setItemFiltersState: (filters: FilterSet) => void;
	clearFilters: () => void;
}

export function useGLJournalController(): GLJournalController {

	const [pages, setPages] = useState<CachedPage<GLJournal>[]>([]);
	const [pageIndex, setPageIndex] = useState(0);

	const [itemFilters, setItemFilters] = useState<FilterSet>({base_fields: []});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const currentPage = pages[pageIndex];
	const journals = currentPage?.items ?? [];
	const pageNumber = currentPage?.page_number ?? 1;

	const showPrev = pageIndex > 0;
	const showNext = Boolean(currentPage?.has_more);

	const aliveRef = useRef(true);

	useEffect(() => {
		aliveRef.current = true;
		return () => {
			aliveRef.current = false;
		}
	}, []);

	const reload = useCallback(async (filters?: FilterSet) => {

		const activeFilters = filters ?? itemFilters;

		setLoading(true);
		setError(null);

		try {

			const res = ApiResponse.handle(await getGLJournalsListPage(activeFilters));

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
			setError(e?.message ?? "Failed to load journals");
			throw e;

		} finally {

			if (!aliveRef.current) return;
			setLoading(false);

		}

	}, []);

	useEffect(() => {
		reload();
	}, [reload]);

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

			const res = ApiResponse.handle(await getGLJournalsListPage(itemFilters, currentPage.next_cursor ?? undefined));

			if (!res.ok || !res.data) {
				setError(res.message);
				return;
			}

			const page = res.data;

			if (!aliveRef.current) return;
			const newPage: CachedPage<GLJournal> = {
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

	}, [currentPage, pages, pageIndex, itemFilters]);

	const prevPage = useCallback(() => {
		setPageIndex((i) => Math.max(0, i - 1));
	}, []);

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

	return {
		pages,
		currentPage,
		journals,
		loading,
		error,
		reload,
		nextPage,
		prevPage,
		showPrev,
		showNext,
		pageNumber,
		itemFilters,
		setItemFiltersState,
		clearFilters
	};
}