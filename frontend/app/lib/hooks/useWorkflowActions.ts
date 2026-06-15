"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getWorkflow, submitWorkflow, approveWorkflow, rejectWorkflow, getWorkflowHistory } from "../api/workflow";
import { ApiResponse } from "../api/response";
import { WorkflowHistoryStep } from "../types/workflow";

export type WorkflowActions = {
	workflowActive: boolean;
	submitting: boolean;
	approving: boolean;
	rejecting: boolean;
	error: string | null;
	clearError: () => void;
	submit: () => Promise<void>;
	approve: () => Promise<void>;
	reject: () => Promise<void>;
	onStepSelect: (step: { id: string; label: string }) => void;
	historyOpen: boolean;
	historyLoading: boolean;
	history: WorkflowHistoryStep[] | null;
	openHistory: () => void;
	closeHistory: () => void;
};

export function useWorkflowActions(
	documentType: string,
	recordId: number | undefined,
	onSuccess: () => Promise<void>,
): WorkflowActions {

	const [workflowActive, setWorkflowActive] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [approving, setApproving] = useState(false);
	const [rejecting, setRejecting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [historyOpen, setHistoryOpen] = useState(false);
	const [historyLoading, setHistoryLoading] = useState(false);
	const [history, setHistory] = useState<WorkflowHistoryStep[] | null>(null);

	const onSuccessRef = useRef(onSuccess);
	useEffect(() => { onSuccessRef.current = onSuccess; }, [onSuccess]);

	useEffect(() => {
		async function load() {
			const res = ApiResponse.handle(await getWorkflow(documentType));
			if (res.ok && res.data) setWorkflowActive(res.data.is_active);
		}
		load();
	}, [documentType]);

	const submit = useCallback(async () => {

		if (!recordId) return;

		setSubmitting(true);
		setError(null);

		try {
			const res = ApiResponse.handle(await submitWorkflow(documentType, recordId));
			if (!res.ok) throw new Error(res.message ?? "Failed to submit");
			await onSuccessRef.current();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to submit");
		} finally {
			setSubmitting(false);
		}

	}, [documentType, recordId]);

	const approve = useCallback(async () => {

		if (!recordId) return;

		setApproving(true);
		setError(null);

		try {
			const res = ApiResponse.handle(await approveWorkflow(documentType, recordId));
			if (!res.ok) throw new Error(res.message ?? "Failed to approve");
			await onSuccessRef.current();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to approve");
		} finally {
			setApproving(false);
		}

	}, [documentType, recordId]);

	const reject = useCallback(async () => {

		if (!recordId) return;

		setRejecting(true);
		setError(null);

		try {
			const res = ApiResponse.handle(await rejectWorkflow(documentType, recordId));
			if (!res.ok) throw new Error(res.message ?? "Failed to reject");
			await onSuccessRef.current();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to reject");
		} finally {
			setRejecting(false);
		}

	}, [documentType, recordId]);

	const clearError = useCallback(() => setError(null), []);

	const onStepSelect = useCallback((step: { id: string; label: string }) => {
		if (step.id === "submit") submit();
		if (step.id === "approve") approve();
		if (step.id === "reject") reject();
	}, [submit, approve, reject]);

	const openHistory = useCallback(async () => {

		if (!recordId) return;

		setHistoryOpen(true);
		setHistoryLoading(true);

		try {
			const res = ApiResponse.handle(await getWorkflowHistory(documentType, recordId));
			if (res.ok && res.data) setHistory(res.data.steps);
		} finally {
			setHistoryLoading(false);
		}
		
	}, [documentType, recordId]);

	const closeHistory = useCallback(() => setHistoryOpen(false), []);

	return { workflowActive, submitting, approving, rejecting, error, clearError, submit, approve, reject, onStepSelect, historyOpen, historyLoading, history, openHistory, closeHistory };
	
}
