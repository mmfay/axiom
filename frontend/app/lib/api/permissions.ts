import { deleteJSON, getJSON, patchJSON, postJSON } from "./submissions";
import { APIResult, CursorPage } from "../types/data";
import { UserRolesData } from "../types/users";
import { Role, RoleCreate, RoleOption, RolePatch, RolePermissionsData } from "../types/roles";

export async function getUserRoles(userId: number): Promise<APIResult<UserRolesData>> {
	return getJSON(`/users/${userId}/roles`);
}

export async function addUserRole(userId: number, roleId: number): Promise<APIResult<void>> {
	return postJSON(`/users/${userId}/roles/${roleId}`);
}

export async function removeUserRole(userId: number, roleId: number): Promise<APIResult<void>> {
	return deleteJSON(`/users/${userId}/roles/${roleId}`);
}

export async function getRolesListPage(cursor?: string): Promise<APIResult<CursorPage<Role>>> {
	return getJSON("/roles", cursor ? { cursor } : undefined);
}

export async function getAllRoles(): Promise<APIResult<RoleOption[]>> {
	return getJSON("/roles/all");
}

export async function createRole(body: RoleCreate): Promise<APIResult<Role>> {
	return postJSON("/roles", body);
}

export async function updateRole(roleId: number, patch: RolePatch): Promise<APIResult<Role>> {
	return patchJSON(`/roles/${roleId}`, patch);
}

export async function getRolePermissions(roleId: number): Promise<APIResult<RolePermissionsData>> {
	return getJSON(`/roles/${roleId}/permissions`);
}

export async function addRolePermission(roleId: number, permissionId: number): Promise<APIResult<void>> {
	return postJSON(`/roles/${roleId}/permissions/${permissionId}`);
}

export async function removeRolePermission(roleId: number, permissionId: number): Promise<APIResult<void>> {
	return deleteJSON(`/roles/${roleId}/permissions/${permissionId}`);
}
