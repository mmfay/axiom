// types/user.ts
import { UserEmail } from "./auth"

export interface UserOption {
	id: number;
	email: string;
}

export interface Users extends UserEmail {
	id: number;
	user_id: string;
	is_enabled: boolean;
}

export interface UsersPatch {
	email?: string;
	is_enabled?: boolean;
}

export interface UsersCreate extends UserEmail {
	user_id: string;
	password: string;
}

export interface UserRole {
	id: number;
	name: string;
	description: string | null;
}

export interface UserRolesData {
	assigned: UserRole[];
	available: UserRole[];
}