import { Handle, Position } from "@xyflow/react";

export default function EndNode() {
	return (
		<div className="flex items-center justify-center w-15 h-15 rounded-full bg-rose-500 dark:bg-rose-600 text-white text-sm font-semibold shadow-sm">
			<Handle type="target" position={Position.Left} className="!bg-rose-700 !w-2.5 !h-2.5" />
			End
		</div>
	);
}
