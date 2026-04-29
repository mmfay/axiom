import { getJSON, postJSON } from "./submissions";
import { LoginRequest, ResetPassword, SetCompanyRequest, SetRoleRequest, SignupRequest, Token, UserEmail } from "../types/auth";
import { APIResult } from "../types/data";

export async function login(body: LoginRequest): Promise<APIResult<null>> {
	return postJSON("/auth/login", body);
}

export async function logout(): Promise<APIResult<null>> {
	return postJSON("/auth/logout");
}

export async function signup(body: SignupRequest): Promise<APIResult<null>> {
	return postJSON("/auth/signup", body);
}

export async function forgotPassword(body: UserEmail): Promise<APIResult<null>> {
	return postJSON("/auth/forgot-password", body );
}

export async function resetPassword(body: ResetPassword): Promise<APIResult<null>> {
	return postJSON("/auth/reset-password", body);
}

export async function verifyAccount(body: Token): Promise<APIResult<null>> {
	return postJSON("/auth/verify-account", body);
}

export async function me(): Promise<APIResult<null>> {
	return getJSON("/auth/me");
}

export async function setRole(body: SetRoleRequest): Promise<APIResult<null>> {
	return postJSON("/auth/set-role", body);
}

export async function setCompany(body: SetCompanyRequest): Promise<APIResult<null>> {
	return postJSON("/auth/set-company", body);
}