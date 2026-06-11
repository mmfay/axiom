"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiResponse } from "../api/response";
import { getJournal, createJournal, updateJournal, postJournal, voidJournal } from "../api/gl_journals";
import { getAllAccounts } from "../api/gl_accounts";
import { getGLDimensions, getGLDimensionValues } from "../api/gl_dimensions";
import { GLJournal, CreateGLJournalRequest } from "../types/gl_journals";
import { GLAccount } from "../types/gl_accounts";
import { DimensionWithValues } from "../types/gl_dimensions";

export type GLJournalDetail = {
	journal: GLJournal | null;
	accounts: GLAccount[];
	dimensions: DimensionWithValues[];
	loading: boolean;
	error: string | null;
	saving: boolean;
	posting: boolean;
	voiding: boolean;
	fetchJournal: (id: number) => Promise<void>;
	save: (payload: CreateGLJournalRequest) => Promise<void>;
	post: (payload: CreateGLJournalRequest) => Promise<void>;
	void: () => Promise<void>;
	clearError: () => void;
};

export function useGLJournalDetail(): GLJournalDetail {

	const router = useRouter();

	const [journal, setJournal] = useState<GLJournal | null>(null);
	const [accounts, setAccounts] = useState<GLAccount[]>([]);
	const [dimensions, setDimensions] = useState<DimensionWithValues[]>([]);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [posting, setPosting] = useState(false);
	const [voiding, setVoiding] = useState(false);

	useEffect(() => {

		let cancelled = false;

		(async () => {
			try {
				const [acctRes, dimRes] = await Promise.all([getAllAccounts(), getGLDimensions()]);
				if (cancelled) return;
				const acctData = ApiResponse.handle(acctRes);
				const dimData = ApiResponse.handle(dimRes);
				if (acctData.ok && acctData.data) setAccounts(acctData.data);
				if (dimData.ok && dimData.data) {
					const withValues = await Promise.all(
						dimData.data.map(async (d) => {
							const vRes = ApiResponse.handle(await getGLDimensionValues(d.id));
							return { ...d, values: vRes.ok && vRes.data ? vRes.data : [] };
						})
					);
					if (!cancelled) setDimensions(withValues);
				}
			} catch {
				// navigation cancelled — ignore
			}
		})();
		return () => { cancelled = true; };
	}, []);

	// fetch journal
	const fetchJournal = useCallback(async (id: number) => {

		setLoading(true);
		setError(null);

		try {
			const res = ApiResponse.handle(await getJournal(id));
			if (!res.ok || !res.data) 
				throw new Error(res.message ?? "Journal not found");
			setJournal(res.data);
		} catch (e: any) {
			setError(e?.message ?? "Failed to load journal");
		} finally {
			setLoading(false);
		}

	}, []);

	// save journal
	const save = useCallback(async (payload: CreateGLJournalRequest) => {

		setError(null);
		setSaving(true);

		try {
			if (!journal) {
				const res = ApiResponse.handle(await createJournal(payload));
				if (!res.ok || !res.data) throw new Error(res.message ?? "Failed to save");
				router.push(`/gl/journals/${res.data.id}`);
			} else {
				const res = ApiResponse.handle(await updateJournal(journal.id, payload));
				if (!res.ok || !res.data) throw new Error(res.message ?? "Failed to save");
				setJournal(res.data);
			}
		} catch (e: any) {
			setError(e?.message ?? "Failed to save");
		} finally {
			setSaving(false);
		}

	}, [journal, router]);

	// post journal
	const post = useCallback(async (payload: CreateGLJournalRequest) => {
		setError(null);
		setPosting(true);
		try {
			const saveRes = ApiResponse.handle(
				!journal
					? await createJournal(payload)
					: await updateJournal(journal.id, payload)
			);
			if (!saveRes.ok || !saveRes.data) throw new Error(saveRes.message ?? "Failed to save");

			const postRes = ApiResponse.handle(await postJournal(saveRes.data.id));
			if (!postRes.ok || !postRes.data) throw new Error(postRes.message ?? "Failed to post");

			if (!journal) {
				router.push(`/gl/journals/${saveRes.data.id}`);
			} else {
				setJournal(postRes.data);
			}
		} catch (e: any) {
			setError(e?.message ?? "Failed to post");
		} finally {
			setPosting(false);
		}
	}, [journal, router]);

	// void journal
	const void_ = useCallback(async () => {

		if (!journal) return;

		setError(null);
		setVoiding(true);

		try {
			const res = ApiResponse.handle(await voidJournal(journal.id));
			if (!res.ok || !res.data) throw new Error(res.message ?? "Failed to void");
			setJournal(res.data);
		} catch (e: any) {
			setError(e?.message ?? "Failed to void");
		} finally {
			setVoiding(false);
		}

	}, [journal]);

	const clearError = useCallback(() => setError(null), []);

	return {
		journal,
		accounts,
		dimensions,
		loading,
		error,
		saving,
		posting,
		voiding,
		fetchJournal,
		save,
		post,
		void: void_,
		clearError,
	};
	
}
