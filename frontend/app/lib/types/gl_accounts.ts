export interface GLAccount {
	id: number;
	account_number: string;
	name: string;
	account_type: string;
	normal_balance: "debit" | "credit";
	description: string | null;
	is_active: boolean;
}

export interface GLAccountCreate {
	account_number: string;
	name: string;
	account_type: string;
	normal_balance: "debit" | "credit";
	description?: string;
}

export interface GLAccountPatch {
	account_number?: string;
	name?: string;
	account_type?: string;
	normal_balance?: "debit" | "credit";
	description?: string;
	is_active?: boolean;
}
