"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	ReactFlow,
	Background,
	Controls,
	MiniMap,
	addEdge,
	useNodesState,
	useEdgesState,
	type Node,
	type Edge,
	type Connection,
	type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useWorkflowController } from "@/app/lib/hooks/useWorkflowController";
import { useRolesDetail } from "@/app/lib/hooks/useRolesDetail";
import { useUsersDetail } from "@/app/lib/hooks/useUsersDetail";
import { WorkflowNode, WorkflowSummary } from "@/app/lib/types/workflow";
import { RoleOption } from "@/app/lib/types/roles";
import { UserOption } from "@/app/lib/types/users";
import ErrorBanner from "@/app/components/ErrorBanner";
import StartNode from "./_components/StartNode";
import EndNode from "./_components/EndNode";
import ApprovalNode, { type ApprovalNodeData } from "./_components/ApprovalNode";

// ── Editor ────────────────────────────────────────────────────────────────────

function makeApprovalNode(
	id: string,
	x: number,
	y: number,
	roles: RoleOption[],
	users: UserOption[],
	onChange: ApprovalNodeData["onChange"],
	onDelete: ApprovalNodeData["onDelete"],
): Node {
	return {
		id,
		type: "approval",
		position: { x, y },
		data: { label: "Approval", approver_type: null, approver_id: null, roles, users, onChange, onDelete } satisfies ApprovalNodeData,
	};
}

interface EditorProps {
	documentType: string;
	label: string;
	roles: RoleOption[];
	users: UserOption[];
	detailLoading: boolean;
	onBack: () => void;
	onLoadGraph: ReturnType<typeof useWorkflowController>["onLoadGraph"];
	onSaveGraph: ReturnType<typeof useWorkflowController>["onSaveGraph"];
	onError: (msg: string) => void;
}

function WorkflowEditor({ documentType, label, roles, users, detailLoading, onBack, onLoadGraph, onSaveGraph, onError }: EditorProps) {
	const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	const handleNodeChange = useCallback((id: string, patch: Partial<ApprovalNodeData>) => {
		setNodes((prev) => prev.map((n) => n.id === id ? { ...n, data: { ...n.data, ...patch } } : n));
	}, [setNodes]);

	const handleNodeDelete = useCallback((id: string) => {
		setNodes((prev) => prev.filter((n) => n.id !== id));
		setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
	}, [setNodes, setEdges]);

	function buildNodes(
		rawNodes: Array<{ id: string; node_type: string; label: string; approver_type: string | null; approver_id: number | null; position_x: number; position_y: number }>,
		r: RoleOption[], u: UserOption[],
	): Node[] {
		return rawNodes.map((n) => {
			if (n.node_type === "start") return { id: n.id, type: "start", position: { x: n.position_x, y: n.position_y }, data: {} };
			if (n.node_type === "end")   return { id: n.id, type: "end",   position: { x: n.position_x, y: n.position_y }, data: {} };
			return {
				id: n.id, type: "approval",
				position: { x: n.position_x, y: n.position_y },
				data: { label: n.label, approver_type: n.approver_type as "role" | "user" | null, approver_id: n.approver_id, roles: r, users: u, onChange: handleNodeChange, onDelete: handleNodeDelete } satisfies ApprovalNodeData,
			};
		});
	}

	useEffect(() => {
		if (detailLoading) return;
		async function load() {
			try {
				const wf = await onLoadGraph(documentType);
				if (wf.nodes.length === 0) {
					setNodes([
						{ id: "start", type: "start", position: { x: 80,  y: 160 }, data: {} },
						{ id: "end",   type: "end",   position: { x: 480, y: 160 }, data: {} },
					]);
				} else {
					setNodes(buildNodes(wf.nodes, roles, users));
					setEdges(wf.edges.map((e) => ({ id: e.id, source: e.source, target: e.target })));
				}
			} catch (e) {
				onError(e instanceof Error ? e.message : "Failed to load workflow");
			} finally {
				setLoading(false);
			}
		}
		load();
	}, [documentType, detailLoading]); // eslint-disable-line react-hooks/exhaustive-deps

	const onConnect = useCallback(
		(params: Connection) => setEdges((eds) => addEdge({ ...params, id: `e-${params.source}-${params.target}` }, eds)),
		[setEdges],
	);

	function addApprovalStep() {
		const id = `approval-${Date.now()}`;
		const centerX = nodes.reduce((s, n) => s + n.position.x, 0) / Math.max(nodes.length, 1);
		setNodes((prev) => [...prev, makeApprovalNode(id, centerX, 80, roles, users, handleNodeChange, handleNodeDelete)]);
	}

	async function handleSave() {
		setSaving(true); setSaved(false);
		const saveNodes = nodes.map((n) => {
			const d = n.data as ApprovalNodeData;
			return { id: n.id, node_type: n.type as WorkflowNode["node_type"], label: n.type === "start" ? "Start" : n.type === "end" ? "End" : d.label, approver_type: n.type === "approval" ? (d.approver_type ?? null) : null, approver_id: n.type === "approval" ? (d.approver_id ?? null) : null, position_x: n.position.x, position_y: n.position.y };
		});
		try {
			await onSaveGraph(documentType, { nodes: saveNodes, edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })) });
			setSaved(true);
			setTimeout(() => setSaved(false), 2500);
		} catch (e) {
			onError(e instanceof Error ? e.message : "Failed to save workflow");
		} finally {
			setSaving(false);
		}
	}

	const nodeTypes: NodeTypes = useMemo(() => ({ start: StartNode, end: EndNode, approval: ApprovalNode }), []);

	return (
		<div className="-m-6 flex flex-col h-[calc(100vh-3.5rem)]">
			<div className="flex items-center gap-3 px-6 py-3 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-neutral-950 shrink-0">
				<button
					onClick={onBack}
					className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<h1 className="text-sm font-semibold text-gray-900 dark:text-white">{label} Workflow</h1>
				<div className="ml-auto flex items-center gap-2">
					<button
						onClick={addApprovalStep}
						className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-md transition-colors"
					>
						<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						Add Step
					</button>
					<button
						onClick={handleSave}
						disabled={saving}
						className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors disabled:opacity-50"
					>
						{saving ? "Saving…" : saved ? "Saved" : "Save"}
					</button>
				</div>
			</div>

			<div className="flex-1 relative">
				{loading ? (
					<div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400 dark:text-slate-500">Loading…</div>
				) : (
					<ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView className="bg-gray-50 dark:bg-neutral-950">
						<Background gap={16} size={1} className="!text-gray-200 dark:!text-white/5" />
						<Controls className="[&_button]:bg-white dark:[&_button]:bg-neutral-900 [&_button]:border-gray-200 dark:[&_button]:border-white/10" />
						<MiniMap className="!bg-gray-100 dark:!bg-neutral-900 !border-gray-200 dark:!border-white/10" />
					</ReactFlow>
				)}
			</div>
		</div>
	);
}

// ── List ──────────────────────────────────────────────────────────────────────

export default function WorkflowsPage() {
	const { workflows, loading, error, setError, onToggle, onLoadGraph, onSaveGraph } = useWorkflowController();
	const { roles, loading: rolesLoading } = useRolesDetail();
	const { users, loading: usersLoading } = useUsersDetail();
	const detailLoading = rolesLoading || usersLoading;
	const [toggling, setToggling] = useState<string | null>(null);
	const [selected, setSelected] = useState<WorkflowSummary | null>(null);

	async function handleToggle(w: WorkflowSummary) {
		setToggling(w.document_type);
		await onToggle(w.document_type, !w.is_active);
		setToggling(null);
	}

	return (
		<>
			{error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

			{selected ? (
				<WorkflowEditor
					documentType={selected.document_type}
					label={selected.label}
					roles={roles}
					users={users}
					detailLoading={detailLoading}
					onBack={() => { setError(null); setSelected(null); }}
					onLoadGraph={onLoadGraph}
					onSaveGraph={onSaveGraph}
					onError={setError}
				/>
			) : (
				<div className="p-8 flex flex-col gap-6 max-w-3xl">
					<div>
						<h1 className="text-xl font-semibold text-gray-900 dark:text-white">Workflows</h1>
						<p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Enable approval workflows per document type and design the steps.</p>
					</div>

					<div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
						{loading ? (
							<div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-slate-500">Loading…</div>
						) : (
							<table className="w-full text-sm text-left">
								<thead className="text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
									<tr>
										<th className="px-4 py-3">Document Type</th>
										<th className="px-4 py-3 w-24">Status</th>
										<th className="px-4 py-3 w-32 text-right">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100 dark:divide-white/5">
									{workflows.map((w) => (
										<tr key={w.document_type} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
											<td className="px-4 py-3">
												<button
													onClick={() => setSelected(w)}
													className="text-gray-800 dark:text-slate-200 font-medium hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
												>
													{w.label}
												</button>
											</td>
											<td className="px-4 py-3">
												<span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
													w.is_active
														? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
														: "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-slate-400"
												}`}>
													{w.is_active ? "Active" : "Inactive"}
												</span>
											</td>
											<td className="px-4 py-3 text-right">
												<button
													onClick={() => handleToggle(w)}
													disabled={toggling === w.document_type}
													className="text-xs text-gray-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors disabled:opacity-40"
												>
													{w.is_active ? "Disable" : "Enable"}
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
				</div>
			)}
		</>
	);
}
