"use client";

import { useCallback, useEffect } from "react";
import { use } from "react";
import { useGLJournalDetail } from "@/app/lib/hooks/useGLJournalDetail";
import { useWorkflowActions } from "@/app/lib/hooks/useWorkflowActions";
import JournalForm from "../_components/JournalForm";
import WorkflowHistoryModal from "@/app/components/WorkflowHistoryModal";

export default function JournalDetailPage({ params }: { params: Promise<{ id: string }> }) {

	const { id } = use(params);
	const detail = useGLJournalDetail();

	const refresh = useCallback(
		() => detail.fetchJournal(Number(id)),
		[detail.fetchJournal, id],
	);

	const wf = useWorkflowActions("gl_journal", detail.journal?.id, refresh);

	useEffect(() => {
		detail.fetchJournal(Number(id));
	}, [id]); // eslint-disable-line react-hooks/exhaustive-deps

	if (detail.loading)
		return <div className="p-8 text-sm text-gray-400 dark:text-slate-500">Loading&hellip;</div>;

	if (detail.error && !detail.journal)
		return <div className="p-8 text-sm text-red-500 dark:text-red-400">{detail.error}</div>;

	if (!detail.journal)
		return null;

	const error = wf.error ?? detail.error;
	const clearError = () => { wf.clearError(); detail.clearError(); };

	return (
		<>
			<JournalForm
				journal={detail.journal}
				accounts={detail.accounts}
				dimensions={detail.dimensions}
				workflowActive={wf.workflowActive}
				saving={detail.saving}
				posting={detail.posting}
				voiding={detail.voiding}
				submitting={wf.submitting}
				approving={wf.approving}
				rejecting={wf.rejecting}
				error={error}
				onSave={detail.save}
				onPost={detail.post}
				onVoid={detail.void}
				onStepSelect={wf.onStepSelect}
				onHistory={wf.openHistory}
				onDismissError={clearError}
			/>
			{wf.historyOpen && (
				<WorkflowHistoryModal
					steps={wf.history ?? []}
					loading={wf.historyLoading}
					onClose={wf.closeHistory}
				/>
			)}
		</>
	);
}
