export interface WorkflowSummary {
	document_type: string;
	label: string;
	is_active: boolean;
}

export interface WorkflowNode {
	id: string;
	node_type: "start" | "end" | "approval";
	label: string;
	approver_type: "role" | "user" | null;
	approver_id: number | null;
	position_x: number;
	position_y: number;
}

export interface WorkflowEdge {
	id: string;
	source: string;
	target: string;
}

export interface WorkflowDetail extends WorkflowSummary {
	nodes: WorkflowNode[];
	edges: WorkflowEdge[];
}

export interface SaveGraphRequest {
	nodes: WorkflowNode[];
	edges: WorkflowEdge[];
}

export interface WorkflowHistoryStep {
	label: string;
	status: "approved" | "rejected" | "pending";
	actioned_by: string | null;
	actioned_at: string | null;
}

export interface WorkflowHistory {
	steps: WorkflowHistoryStep[];
}