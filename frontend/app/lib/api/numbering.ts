import { getJSON, postJSON, patchJSON } from "./submissions";
import { APIResult } from "../types/data";
import { NumberingScheme, CreateNumberingSchemeRequest, UpdateNumberingSchemeRequest } from "../types/numbering";

export async function getSchemes(): Promise<APIResult<NumberingScheme[]>> {
	return getJSON("/numbering");
}

export async function createScheme(body: CreateNumberingSchemeRequest): Promise<APIResult<NumberingScheme>> {
	return postJSON("/numbering", body);
}

export async function updateScheme(id: number, body: UpdateNumberingSchemeRequest): Promise<APIResult<NumberingScheme>> {
	return patchJSON(`/numbering/${id}`, body);
}

export async function previewNext(documentType: string): Promise<APIResult<{ next: string }>> {
	return getJSON(`/numbering/preview/${documentType}`);
}