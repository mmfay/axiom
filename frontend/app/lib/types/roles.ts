export interface Role {
	id: number;
	name: string;
	description: string | null;
}

export interface RoleOption {
	id: number;
	name: string;
}

export interface RoleCreate {
	name: string;
	description?: string;
}

export interface RolePatch {
	name?: string;
	description?: string;
}

export interface Permission {
	id: number;
	name: string;
	description: string | null;
}

export interface RolePermissionsData {
	assigned: Permission[];
	available: Permission[];
}
