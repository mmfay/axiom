import { getJSON, patchJSON } from "./submissions";
import { APIResult, CursorPage } from "../types/data";
import { Users, UsersPatch } from "../types/users";

export async function getUsersListPage(cursor?: string): Promise<APIResult<CursorPage<Users>>> {
	return getJSON("/users/listPage", cursor ? { cursor } : undefined);
}

export async function updateUsers(recID: number, patch: UsersPatch): Promise<APIResult<Users>> {
	return patchJSON(`/users/${encodeURIComponent(recID)}`);
}