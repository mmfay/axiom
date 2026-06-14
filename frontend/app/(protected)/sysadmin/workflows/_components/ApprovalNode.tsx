import { useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { RoleOption } from "@/app/lib/types/roles";
import { UserOption } from "@/app/lib/types/users";

export interface ApprovalNodeData extends Record<string, unknown> {
	label: string;
	approver_type: "role" | "user" | null;
	approver_id: number | null;
	roles: RoleOption[];
	users: UserOption[];
	onChange: (id: string, patch: Partial<ApprovalNodeData>) => void;
	onDelete: (id: string) => void;
}

export default function ApprovalNode({ id, data }: NodeProps) {
	
	const d = data as ApprovalNodeData;
	const [expanded, setExpanded] = useState(false);

	const approverOptions = d.approver_type === "role"
		? d.roles.map((r) => ({ id: r.id, name: r.name }))
		: d.users.map((u) => ({ id: u.id, name: u.email }));

	const approverName = d.approver_id
		? approverOptions.find((o) => o.id === d.approver_id)?.name
		: null;

	const handles = (
		<>
			<Handle type="target" position={Position.Left} className="!bg-blue-500 !w-2.5 !h-2.5" />
			<Handle type="source" position={Position.Right} className="!bg-blue-500 !w-2.5 !h-2.5" />
		</>
	);

	if (!expanded) {
		return (
			<div
				onClick={() => setExpanded(true)}
				className="nodrag cursor-pointer w-44 rounded-lg border border-blue-200 dark:border-blue-800/50 bg-white dark:bg-neutral-900 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all"
			>
				{handles}
				<div className="px-3 py-2.5">
					<div className="flex items-center gap-1.5 mb-0.5">
						<span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
						<span className="text-xs font-semibold text-gray-800 dark:text-slate-200 truncate">
							{d.label || "Approval"}
						</span>
					</div>
					<p className="text-xs text-gray-400 dark:text-slate-500 truncate pl-3">
						{approverName
							? `${d.approver_type === "role" ? "Role" : "User"}: ${approverName}`
							: d.approver_type
								? `${d.approver_type === "role" ? "Role" : "User"} — not set`
								: "Not configured"}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-56 rounded-lg border border-blue-300 dark:border-blue-700/60 bg-white dark:bg-neutral-900 shadow-lg">
			{handles}

			<div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-white/10">
				<span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Approval</span>
				<div className="flex items-center gap-1.5">
					<button
						onClick={() => setExpanded(false)}
						className="nodrag text-gray-300 dark:text-slate-600 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
						title="Collapse"
					>
						<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
						</svg>
					</button>
					<button
						onClick={() => d.onDelete(id)}
						className="nodrag text-gray-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
						title="Remove step"
					>
						<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			</div>

			<div className="nodrag px-3 py-2 flex flex-col gap-2">
				<input
					type="text"
					value={d.label}
					onChange={(e) => d.onChange(id, { label: e.target.value })}
					placeholder="Step label"
					className="text-sm w-full bg-transparent border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-gray-800 dark:text-slate-200 focus:outline-none focus:border-blue-400"
				/>

				<div className="flex gap-1">
					{(["role", "user"] as const).map((t) => (
						<button
							key={t}
							onClick={() => d.onChange(id, { approver_type: t, approver_id: null })}
							className={`flex-1 text-xs py-1 rounded border transition-colors ${
								d.approver_type === t
									? "border-blue-500 bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400"
									: "border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 hover:border-blue-300"
							}`}
						>
							{t === "role" ? "Role" : "User"}
						</button>
					))}
				</div>

				{d.approver_type && (
					<select
						value={d.approver_id ?? ""}
						onChange={(e) => d.onChange(id, { approver_id: e.target.value ? Number(e.target.value) : null })}
						className="text-sm w-full bg-transparent border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-gray-800 dark:text-slate-200 focus:outline-none focus:border-blue-400"
					>
						<option value="">— select {d.approver_type} —</option>
						{approverOptions.map((o) => (
							<option key={o.id} value={o.id}>{o.name}</option>
						))}
					</select>
				)}
			</div>
		</div>
	);
}
