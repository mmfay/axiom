export interface GLDimension {
	id: number;
	slot: number;
	name: string;
	is_active: boolean;
}

export interface GLDimensionCreate {
	slot: number;
	name: string;
	is_active?: boolean;
}

export interface GLDimensionPatch {
	name?: string;
	is_active?: boolean;
}

export interface GLDimensionValue {
	id: number;
	dimension_id: number;
	code: string;
	name: string;
	is_active: boolean;
}

export interface GLDimensionValueCreate {
	code: string;
	name: string;
}

export interface GLDimensionValuePatch {
	code?: string;
	name?: string;
	is_active?: boolean;
}
