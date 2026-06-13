import { Handle, Position } from "@xyflow/react";

export default function StartNode() {
	return (
		<div className="flex items-center justify-center w-15 h-15 rounded-full bg-emerald-500 dark:bg-emerald-600 text-white text-sm font-semibold shadow-sm">
			Start
			<Handle type="source" position={Position.Right} className="!bg-emerald-700 !w-2.5 !h-2.5" />
		</div>
	);
}
