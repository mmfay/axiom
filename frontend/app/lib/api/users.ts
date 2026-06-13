import { deleteJSON, getJSON, patchJSON, postJSON } from "./submissions";
import { APIResult, CursorPage, FilterSet } from "../types/data";
import { UserOption, Users, UsersCreate, UsersPatch } from "../types/users";

export async function getAllUsers(): Promise<APIResult<UserOption[]>> {
	return getJSON("/users/all");
}

export async function getUsersListPage(filters?: FilterSet, cursor?: string): Promise<APIResult<CursorPage<Users>>> {
	const params: Record<string, string> = {};
	if (cursor) params.cursor = cursor;
	for (const f of filters?.base_fields ?? []) {
		if (f.filter_value) params[f.field_id] = f.filter_value;
	}
	return getJSON("/users/listPage", Object.keys(params).length ? params : undefined);
}

export async function updateUsers(recID: number, patch: UsersPatch): Promise<APIResult<Users>> {
	return patchJSON(`/users/${encodeURIComponent(recID)}`, patch);
}

export async function createUser(body: UsersCreate): Promise<APIResult<Users>> {
	return postJSON("/users", body);
}

export async function deleteUser(recID: number): Promise<APIResult<null>> {
	return deleteJSON(`/users/${encodeURIComponent(recID)}`);
}