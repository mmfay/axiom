export type APIResult<T> = { 
	ok: boolean; 
	message: string; 
	data?: T; 
	status: number; 
	statusText: string 
}

export interface CursorPage<T> {
	items: T[];
    next_cursor: string | null;
    has_more: boolean;
}

export interface CachedPage<T> {
	page_number: number;
	items: T[];
	next_cursor: string | null;
	has_more: boolean;
};

export type FilterKeys = {
	field_id: string;
	filter_value: string;
};

export interface FilterSet {
	base_fields?: FilterKeys[];
	//custom_fields?: FilterKeys[];
}