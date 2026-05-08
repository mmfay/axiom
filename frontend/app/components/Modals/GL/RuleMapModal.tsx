"use client";

import { useEffect, useMemo } from "react";
import { GLAccount } from "@/app/lib/types/gl_accounts";
import { AccountRule } from "@/app/lib/types/gl_account_rules";
import { DimensionWithValues, GLDimensionValue } from "@/app/lib/types/gl_dimensions";

// ── Layout constants ──────────────────────────────────────────────────────────

const NODE_W = 196;
const NODE_H = 68;
const H_GAP = 48;
const V_GAP = 80;
const PAD = 48;

// ── Types ─────────────────────────────────────────────────────────────────────

type NodeKind = "account" | "blank" | "value";

type TreeNode = {
	id: string;
	kind: NodeKind;
	label: string;
	sublabel?: string;
	children: TreeNode[];
	x: number;
	y: number;
};

// ── Tree builder ──────────────────────────────────────────────────────────────

function buildTree(
	account: GLAccount,
	rules: AccountRule[],
	dimById: Map<number, DimensionWithValues>,
	valueById: Map<number, GLDimensionValue>,
): TreeNode {
	const topLevel = rules.filter((r) => r.parent_value_id === null);
	const conditional = rules.filter((r) => r.parent_value_id !== null);

	const condByParent = new Map<number, AccountRule[]>();
	for (const r of conditional) {
		const k = r.parent_value_id!;
		condByParent.set(k, [...(condByParent.get(k) ?? []), r]);
	}

	function makeDimNodes(rule: AccountRule): TreeNode[] {
		const dim = dimById.get(rule.dimension_id);
		const dimLabel = dim ? `D${dim.slot} · ${dim.name}` : `Dim ${rule.dimension_id}`;

		const allValues = dim?.values ?? [];
		const visibleValues = rule.allowed_value_ids.length > 0
			? allValues.filter((v) => v.is_active && rule.allowed_value_ids.includes(v.id))
			: allValues.filter((v) => v.is_active);

		const valueNodes: TreeNode[] = visibleValues.map((v) => ({
			id: `val-${v.id}`,
			kind: "value" as NodeKind,
			label: v.code,
			sublabel: v.name,
			children: (condByParent.get(v.id) ?? []).flatMap(makeDimNodes),
			x: 0,
			y: 0,
		}));

		if (rule.is_required) {
			return valueNodes;
		}

		const blankNode: TreeNode = {
			id: `blank-${rule.id}`,
			kind: "blank",
			label: dimLabel,
			sublabel: "Optional",
			children: [],
			x: 0,
			y: 0,
		};
		return [blankNode, ...valueNodes];
	}

	return {
		id: "account",
		kind: "account",
		label: account.account_number,
		sublabel: account.name,
		children: topLevel.flatMap(makeDimNodes),
		x: 0,
		y: 0,
	};
}

// ── Layout ────────────────────────────────────────────────────────────────────

function doLayout(node: TreeNode, depth: number, leafRef: { n: number }): void {
	node.y = depth * (NODE_H + V_GAP) + PAD;

	if (node.children.length === 0) {
		node.x = leafRef.n * (NODE_W + H_GAP) + NODE_W / 2 + PAD;
		leafRef.n++;
		return;
	}

	node.children.forEach((c) => doLayout(c, depth + 1, leafRef));
	node.x = (node.children[0].x + node.children[node.children.length - 1].x) / 2;
}

function flatten(node: TreeNode, nodes: TreeNode[], edges: [TreeNode, TreeNode][]) {
	nodes.push(node);
	for (const child of node.children) {
		edges.push([node, child]);
		flatten(child, nodes, edges);
	}
}

// ── SVG node ──────────────────────────────────────────────────────────────────

const STYLES: Record<string, { fill: string; stroke: string; text: string; sub: string; dash?: string }> = {
	account: { fill: "#4f46e5", stroke: "#4338ca", text: "#ffffff",  sub: "#c7d2fe" },
	blank:   { fill: "#f8fafc", stroke: "#94a3b8",  text: "#64748b", sub: "#94a3b8", dash: "5 3" },
	value:   { fill: "#f5f3ff", stroke: "#ddd6fe",  text: "#5b21b6", sub: "#7c3aed" },
};

function styleFor(n: TreeNode) {
	return STYLES[n.kind] ?? STYLES.value;
}

function SvgNode({ n }: { n: TreeNode }) {
	const s = styleFor(n);
	return (
		<g>
			<rect x={n.x - NODE_W / 2} y={n.y} width={NODE_W} height={NODE_H} rx={10}
				fill={s.fill} stroke={s.stroke} strokeWidth={1.5}
				strokeDasharray={s.dash} />
			<text x={n.x} y={n.y + 27} textAnchor="middle"
				fill={s.text} fontSize={13} fontWeight="600"
				fontFamily="ui-sans-serif, system-ui, sans-serif">
				{n.label}
			</text>
			{n.sublabel && (
				<text x={n.x} y={n.y + 48} textAnchor="middle"
					fill={s.sub} fontSize={11}
					fontFamily="ui-sans-serif, system-ui, sans-serif">
					{n.sublabel}
				</text>
			)}
		</g>
	);
}

function SvgEdge({ from, to }: { from: TreeNode; to: TreeNode }) {
	const x1 = from.x, y1 = from.y + NODE_H;
	const x2 = to.x,   y2 = to.y;
	const mid = (y1 + y2) / 2;
	return (
		<path
			d={`M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`}
			fill="none" stroke="#cbd5e1" strokeWidth={1.5}
			markerEnd="url(#arr)"
		/>
	);
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export default function RuleMapModal({
	account, rules, dimsWithValues, onClose,
}: {
	account: GLAccount;
	rules: AccountRule[];
	dimsWithValues: DimensionWithValues[];
	onClose: () => void;
}) {
	const dimById   = useMemo(() => new Map(dimsWithValues.map((d) => [d.id, d])), [dimsWithValues]);
	const valueById = useMemo(
		() => new Map(dimsWithValues.flatMap((d) => d.values.map((v) => [v.id, v]))),
		[dimsWithValues],
	);

	const { nodes, edges, svgW, svgH } = useMemo(() => {
		const root = buildTree(account, rules, dimById, valueById);
		const leafRef = { n: 0 };
		doLayout(root, 0, leafRef);

		const nodes: TreeNode[] = [];
		const edges: [TreeNode, TreeNode][] = [];
		flatten(root, nodes, edges);

		const svgW = Math.max(leafRef.n * (NODE_W + H_GAP) - H_GAP + PAD * 2, NODE_W + PAD * 2);
		const svgH = Math.max(...nodes.map((n) => n.y)) + NODE_H + PAD;

		return { nodes, edges, svgW, svgH };
	}, [account, rules, dimById, valueById]);

	useEffect(() => {
		const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
		window.addEventListener("keydown", h);
		return () => window.removeEventListener("keydown", h);
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
			onClick={onClose}
		>
			<div
				className="relative bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col"
				style={{ maxWidth: "92vw", maxHeight: "88vh", minWidth: 440 }}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
					<div>
						<h2 className="text-sm font-semibold text-gray-900">Rule map</h2>
						<p className="text-xs text-gray-500 mt-0.5">{account.account_number} · {account.name}</p>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Legend */}
				<div className="flex items-center gap-5 px-5 py-2 border-b border-gray-100 flex-shrink-0">
					{[
						{ color: "bg-indigo-600",                              label: "Account" },
						{ color: "bg-violet-50 border border-violet-300",      label: "Value" },
						{ color: "bg-gray-50 border border-gray-400 border-dashed", label: "Optional (skip)" },
					].map(({ color, label }) => (
						<div key={label} className="flex items-center gap-1.5">
							<div className={`w-3 h-3 rounded-sm flex-shrink-0 ${color}`} />
							<span className="text-xs text-gray-500">{label}</span>
						</div>
					))}
				</div>

				{/* Canvas */}
				<div className="overflow-auto flex-1 p-2">
					{rules.length === 0 ? (
						<div className="flex items-center justify-center h-48 w-96">
							<p className="text-sm text-gray-400">No rules configured for this account.</p>
						</div>
					) : (
						<svg width={svgW} height={svgH} style={{ display: "block", margin: "0 auto" }}>
							<defs>
								<marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
									<path d="M0,0 L0,6 L7,3 z" fill="#cbd5e1" />
								</marker>
							</defs>
							{edges.map(([f, t], i) => <SvgEdge key={i} from={f} to={t} />)}
							{nodes.map((n) => <SvgNode key={n.id} n={n} />)}
						</svg>
					)}
				</div>
			</div>
		</div>
	);
}
