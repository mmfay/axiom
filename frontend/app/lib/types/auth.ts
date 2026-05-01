// types/auth.ts

export interface UserEmail {
	email: string
}

export interface Token {
	token: string
}

export interface LoginRequest extends UserEmail {
	password: string;
}

export interface ResetPassword extends Token {
	password: string;
}

export interface SignupRequest extends UserEmail {
	user_id: string;
	first_name: string;
	last_name: string;
	password: string;
}

export interface SetRoleRequest {
	role_id: number;
}

export interface SetCompanyRequest {
	company_id: number;
}

export interface SetDefaultRoleRequest {
	role_id: number | null;
}

export interface LoginResponse extends UserEmail {
	user_id: number;
	permissions: string[];
}