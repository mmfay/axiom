import { getJSON, patchJSON, postJSON } from "./submissions";
import { APIResult, CursorPage, FilterSet } from "../types/data";
import { GLAccount, GLAccountCreate, GLAccountPatch } from "../types/gl_accounts";

export async function getAllAccounts(): Promise<APIResult<GLAccount[]>> {
	return getJSON("/gl/accounts/all");
}

export async function getGLAccountsListPage(filters?: FilterSet, cursor?: string): Promise<APIResult<CursorPage<GLAccount>>> {
	const params: Record<string, string> = {};
	if (cursor) params.cursor = cursor;
	for (const f of filters?.base_fields ?? []) {
		if (f.filter_value) params[f.field_id] = f.filter_value;
	}
	return getJSON("/gl/accounts", Object.keys(params).length ? params : undefined);
}

export async function createGLAccount(body: GLAccountCreate): Promise<APIResult<GLAccount>> {
	return postJSON("/gl/accounts", body);
}

export async function updateGLAccount(accountId: number, patch: GLAccountPatch): Promise<APIResult<GLAccount>> {
	return patchJSON(`/gl/accounts/${accountId}`, patch);
}
