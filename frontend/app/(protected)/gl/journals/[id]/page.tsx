"use client";

import { useEffect } from "react";
import { use } from "react";
import { useGLJournalDetail } from "@/app/lib/hooks/useGLJournalDetail";
import JournalForm from "../_components/JournalForm";

export default function JournalDetailPage({ params }: { params: Promise<{ id: string }> }) {

	const { id } = use(params);
	const detail = useGLJournalDetail();

	useEffect(() => {
		detail.fetchJournal(Number(id));
	}, [id]);

	if (detail.loading)
		return <div className="p-8 text-sm text-gray-400 dark:text-slate-500">Loading&hellip;</div>;

	if (detail.error && !detail.journal)
		return <div className="p-8 text-sm text-red-500 dark:text-red-400">{detail.error}</div>;

	if (!detail.journal)
		return null;

	return (
		<JournalForm
			journal={detail.journal}
			accounts={detail.accounts}
			dimensions={detail.dimensions}
			saving={detail.saving}
			posting={detail.posting}
			voiding={detail.voiding}
			error={detail.error}
			onSave={detail.save}
			onPost={detail.post}
			onVoid={detail.void}
			onDismissError={detail.clearError}
		/>
	);
}
