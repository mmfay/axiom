"use client";

import { useCallback, useEffect, useState } from "react";
import { listWorkflows, toggleWorkflow, getWorkflow, saveGraph } from "../api/workflow";
import { ApiResponse } from "../api/response";
import { WorkflowDetail, WorkflowSummary, SaveGraphRequest } from "../types/workflow";

export type WorkflowController = {
	workflows: WorkflowSummary[];
	loading: boolean;
	error: string | null;
	setError: (e: string | null) => void;
	onToggle: (documentType: string, isActive: boolean) => Promise<void>;
	onLoadGraph: (documentType: string) => Promise<WorkflowDetail>;
	onSaveGraph: (documentType: string, data: SaveGraphRequest) => Promise<void>;
};

export function useWorkflowController(): WorkflowController {

	const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {

		async function load() {
			const res = ApiResponse.handle(await listWorkflows());
			if (res.ok && res.data) 
				setWorkflows(res.data);
			else 
				setError(res.message ?? "Failed to load workflows");
			setLoading(false);
		}
		load();

	}, []);

	const onToggle = useCallback(async (documentType: string, isActive: boolean) => {

		const res = ApiResponse.handle(await toggleWorkflow(documentType, isActive));

		if (res.ok) {
			setWorkflows((prev) =>
				prev.map((w) => w.document_type === documentType ? { ...w, is_active: isActive } : w)
			);
		} else {
			setError(res.message ?? "Failed to update workflow");
		}

	}, []);

	const onLoadGraph = useCallback(async (documentType: string): Promise<WorkflowDetail> => {

		const res = ApiResponse.handle(await getWorkflow(documentType));

		if (!res.ok || !res.data) 
			throw new Error(res.message ?? "Failed to load workflow");

		return res.data;
		
	}, []);

	const onSaveGraph = useCallback(async (documentType: string, data: SaveGraphRequest): Promise<void> => {

		const res = ApiResponse.handle(await saveGraph(documentType, data));

		if (!res.ok) 
			throw new Error(res.message ?? "Failed to save workflow");

	}, []);

	return { workflows, loading, error, setError, onToggle, onLoadGraph, onSaveGraph };
}
