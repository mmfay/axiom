export interface NumberingScheme {
	id: number;
	document_type: string;
	prefix: string;
	separator: string;
	padding: number;
	include_year: boolean;
	include_month: boolean;
	next_value: number;
	is_active: boolean;
}

export interface CreateNumberingSchemeRequest {
	document_type: string;
	prefix?: string;
	separator?: string;
	padding?: number;
	include_year?: boolean;
	include_month?: boolean;
	next_value?: number;
}

export interface UpdateNumberingSchemeRequest {
	prefix?: string;
	separator?: string;
	padding?: number;
	include_year?: boolean;
	include_month?: boolean;
	next_value?: number;
	is_active?: boolean;
}

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
	gl_journal: "General Journal",
};
