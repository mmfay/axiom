import { getJSON, patchJSON, postJSON } from "./submissions";
import { APIResult, CursorPage } from "../types/data";
import { Users, UsersCreate, UsersPatch } from "../types/users";

export async function getUsersListPage(cursor?: string): Promise<APIResult<CursorPage<Users>>> {
	return getJSON("/users/listPage", cursor ? { cursor } : undefined);
}

export async function updateUsers(recID: number, patch: UsersPatch): Promise<APIResult<Users>> {
	return patchJSON(`/users/${encodeURIComponent(recID)}`, patch);
}

export async function createUser(body: UsersCreate): Promise<APIResult<Users>> {
	return postJSON("/users", body);
}