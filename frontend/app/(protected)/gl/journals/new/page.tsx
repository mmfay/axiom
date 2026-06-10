"use client";

import { useGLJournalDetail } from "@/app/lib/hooks/useGLJournalDetail";
import JournalForm from "../_components/JournalForm";

export default function NewJournalPage() {

	const detail = useGLJournalDetail();

	return (
		<JournalForm
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
