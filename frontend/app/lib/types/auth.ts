// types/auth.ts

export interface UserEmail {
	email: string
}

export interface LoginRequest extends UserEmail {
	password: string;
}

export interface ResetPassword {
	password: string;
	token: string;
}

export interface SignupRequest extends UserEmail {
	user_id: string;
	first_name: string;
	last_name: string;
	password: string;
}

export interface LoginResponse extends UserEmail {
	user_id: number;
	permissions: string[];
}