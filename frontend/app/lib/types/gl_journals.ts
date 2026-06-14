export interface GLJournalLine {
	id?: number;
	account_id: number | null;
	description: string | null;
	debit: number;
	credit: number;
	dim1_value_id: number | null;
	dim2_value_id: number | null;
	dim3_value_id: number | null;
	dim4_value_id: number | null;
	dim5_value_id: number | null;
}

export interface GLJournal {
	id: number;
	journal_date: string;
	reference: string;
	memo: string | null;
	status: "draft" | "posted" | "voided";
	workflow_status: "pending" | "approved" | "rejected" | null;
	total_debit?: number;
	created_at: string;
	posted_at: string | null;
	lines?: GLJournalLine[];
}

export interface CreateGLJournalRequest {
	journal_date: string;
	memo?: string;
	lines: Omit<GLJournalLine, "id">[];
}

export interface UpdateGLJournalRequest {
	journal_date?: string;
	memo?: string;
	lines?: Omit<GLJournalLine, "id">[];
}

export interface DimensionValues {
	dim1_value_id: number | null;
	dim2_value_id: number | null;
	dim3_value_id: number | null;
	dim4_value_id: number | null;
	dim5_value_id: number | null;
}
