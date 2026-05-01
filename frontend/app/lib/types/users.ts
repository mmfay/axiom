// types/user.ts
import { UserEmail } from "./auth"

export interface Users extends UserEmail {
	id: number;
	user_id: string;
	is_enabled: boolean;
}

export interface UsersPatch extends UserEmail {
	user_id: string;
	is_enabled: boolean;
}