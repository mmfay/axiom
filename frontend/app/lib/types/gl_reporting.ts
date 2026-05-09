export interface TrialBalanceRow {
	account_number: string;
	name: string;
	account_type: string;
	debit: number;
	credit: number;
}

export interface TrialBalance {
	as_of: string;
	rows: TrialBalanceRow[];
	total_debit: number;
	total_credit: number;
}
