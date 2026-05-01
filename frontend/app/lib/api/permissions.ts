import { deleteJSON, getJSON, postJSON } from "./submissions";
import { APIResult } from "../types/data";
import { UserRolesData } from "../types/users";

export async function getUserRoles(userId: number): Promise<APIResult<UserRolesData>> {
	return getJSON(`/users/${userId}/roles`);
}

export async function addUserRole(userId: number, roleId: number): Promise<APIResult<void>> {
	return postJSON(`/users/${userId}/roles/${roleId}`);
}

export async function removeUserRole(userId: number, roleId: number): Promise<APIResult<void>> {
	return deleteJSON(`/users/${userId}/roles/${roleId}`);
}
