import { getJSON, patchJSON, postJSON } from "./submissions";
import { APIResult } from "../types/data";
import { WorkflowSummary, WorkflowDetail, SaveGraphRequest } from "../types/workflow";
import { API_BASE_URL } from "../config";

export async function listWorkflows(): Promise<APIResult<WorkflowSummary[]>> {
	return getJSON("/workflows");
}

export async function getWorkflow(documentType: string): Promise<APIResult<WorkflowDetail>> {
	return getJSON(`/workflows/${documentType}`);
}

export async function toggleWorkflow(documentType: string, isActive: boolean): Promise<APIResult<WorkflowSummary>> {
	return patchJSON(`/workflows/${documentType}`, { is_active: isActive });
}

export async function submitWorkflow(documentType: string, recordId: number): Promise<APIResult<void>> {
	return postJSON(`/workflows/${documentType}/${recordId}/submit`);
}

export async function approveWorkflow(documentType: string, recordId: number): Promise<APIResult<void>> {
	return postJSON(`/workflows/${documentType}/${recordId}/approve`);
}

export async function rejectWorkflow(documentType: string, recordId: number): Promise<APIResult<void>> {
	return postJSON(`/workflows/${documentType}/${recordId}/reject`);
}

export async function saveGraph(documentType: string, data: SaveGraphRequest): Promise<APIResult<void>> {
	const res = await fetch(`${API_BASE_URL}/workflows/${documentType}/graph`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(data),
	});
	const ct = res.headers.get("content-type") || "";

	return ct.includes("application/json") ? res.json() : (res.text() as unknown as Promise<any>);
}
