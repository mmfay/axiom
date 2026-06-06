"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { GLJournal } from "@/app/lib/types/gl_journals";
import { useGLJournalController } from "@/app/lib/hooks/useGLJournalController";
import JournalForm from "../_components/JournalForm";

export default function JournalDetailPage({ params }: { params: Promise<{ id: string }> }) {

	const { id } = use(params);
	const { fetchJournal, loading, error } = useGLJournalController();
	const [journal, setJournal] = useState<GLJournal | null>(null);

	useEffect(() => {
		fetchJournal(Number(id)).then(setJournal);
	}, [id, fetchJournal]);

	if (loading)
		return <div className="p-8 text-sm text-gray-400 dark:text-slate-500">Loading&hellip;</div>;
	if (error)
		return <div className="p-8 text-sm text-red-500 dark:text-red-400">{error}</div>;
	if (!journal)
		return null;

	return <JournalForm initial={journal} onMutate={setJournal} />;

}
