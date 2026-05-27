import { getJSON, postJSON, patchJSON } from "./submissions";
import { FilterSet, CursorPage, APIResult } from "../types/data";
import { GLJournal, CreateGLJournalRequest, UpdateGLJournalRequest } from "../types/gl_journals";
import { GLAccount } from "../types/gl_accounts";

export async function getJournals(): Promise<APIResult<GLJournal[]>> {
	return getJSON("/gl/journals");
}

export async function getGLJournalsListPage(filters?: FilterSet, cursor?: string): Promise<APIResult<CursorPage<GLJournal>>> {
	const params: Record<string, string> = {};
	if (cursor) params.cursor = cursor;
	for (const f of filters?.base_fields ?? []) {
		if (f.filter_value) params[f.field_id] = f.filter_value;
	}
	return getJSON("/gl/journals/listPage", Object.keys(params).length ? params : undefined);
}

export async function createJournal(body: CreateGLJournalRequest): Promise<APIResult<GLJournal>> {
	return postJSON("/gl/journals", body);
}

export async function getJournal(id: number): Promise<APIResult<GLJournal>> {
	return getJSON(`/gl/journals/${id}`);
}

export async function updateJournal(id: number, body: UpdateGLJournalRequest): Promise<APIResult<GLJournal>> {
	return patchJSON(`/gl/journals/${id}`, body);
}

export async function postJournal(id: number): Promise<APIResult<GLJournal>> {
	return postJSON(`/gl/journals/${id}/post`);
}

export async function voidJournal(id: number): Promise<APIResult<GLJournal>> {
	return postJSON(`/gl/journals/${id}/void`);
}

export async function getAllAccounts(): Promise<APIResult<GLAccount[]>> {
	return getJSON("/gl/accounts/all");
}
