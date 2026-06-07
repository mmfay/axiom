"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DimensionWithValues } from "@/app/lib/types/gl_dimensions";
import { DimensionValues } from "@/app/lib/types/gl_journals";

interface DimensionPickerProps {
	dimensions: DimensionWithValues[];
	value: DimensionValues;
	onChange: (slot: number, valueId: number | null) => void;
	disabled?: boolean;
}

interface DropdownPos {
	top: number;
	left: number;
}

const slotKey = (slot: number): keyof DimensionValues =>
	`dim${slot}_value_id` as keyof DimensionValues;

export default function DimensionPicker({ dimensions, value, onChange, disabled }: DimensionPickerProps) {
	const [openSlot, setOpenSlot] = useState<number | null>(null);
	const [pos, setPos] = useState<DropdownPos | null>(null);
	const [mounted, setMounted] = useState(false);
	const barRef = useRef<HTMLDivElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => { setMounted(true); }, []);

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			const target = e.target as Node;
			const inBar = barRef.current?.contains(target);
			const inDropdown = dropdownRef.current?.contains(target);
			if (!inBar && !inDropdown) setOpenSlot(null);
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	function toggle(slot: number, isActive: boolean, e: React.MouseEvent<HTMLButtonElement>) {
		if (!isActive || disabled) return;
		if (openSlot === slot) {
			setOpenSlot(null);
			setPos(null);
		} else {
			const rect = e.currentTarget.getBoundingClientRect();
			setPos({ top: rect.bottom + 4, left: rect.left });
			setOpenSlot(slot);
		}
	}

	function select(slot: number, valueId: number | null) {
		onChange(slot, valueId);
		setOpenSlot(null);
		setPos(null);
	}

	const openDim = openSlot !== null ? dimensions.find((d) => d.slot === openSlot) : null;
	const openSelectedId = openSlot !== null ? value[slotKey(openSlot)] : null;

	return (
		<>
			<div ref={barRef} className="inline-flex divide-x divide-gray-200 dark:divide-white/10 border border-gray-200 dark:border-white/10 rounded-md overflow-hidden text-xs">
				{[1, 2, 3, 4, 5].map((slot, idx) => {
					const dim = dimensions.find((d) => d.slot === slot);
					const isActive = !!(dim?.is_active) && !disabled;
					const selectedId = value[slotKey(slot)];
					const selectedVal = dim?.values.find((v) => v.id === selectedId);
					const isOpen = openSlot === slot;

					return (
						<button
							key={slot}
							type="button"
							disabled={!isActive}
							onClick={(e) => toggle(slot, isActive, e)}
							className={[
								"px-2.5 py-1 min-w-10 text-center transition-colors",
								isActive
									? isOpen
										? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
										: selectedVal
										? "bg-transparent text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5"
										: "bg-transparent text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-white/5"
									: "bg-transparent text-gray-200 dark:text-white/15 cursor-not-allowed",
							].join(" ")}
						>
							{selectedVal ? selectedVal.code : "—"}
						</button>
					);
				})}
			</div>

			{/* Portal dropdown — rendered outside overflow-hidden containers */}
			{mounted && openSlot !== null && openDim && pos && createPortal(
				<div
					ref={dropdownRef}
					style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
					className="min-w-44 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-lg shadow-lg py-1 overflow-hidden"
				>
					<div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 border-b border-gray-100 dark:border-white/5">
						{openDim.name}
					</div>
					<button
						type="button"
						onClick={() => select(openSlot, null)}
						className={[
							"w-full text-left px-3 py-1.5 text-xs transition-colors",
							!openSelectedId
								? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
								: "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5",
						].join(" ")}
					>
						— Clear
					</button>
					{openDim.values.filter((v) => v.is_active).map((v) => (
						<button
							key={v.id}
							type="button"
							onClick={() => select(openSlot, v.id)}
							className={[
								"w-full text-left px-3 py-1.5 text-xs flex items-baseline gap-2 transition-colors",
								openSelectedId === v.id
									? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
									: "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5",
							].join(" ")}
						>
							<span className="font-mono font-medium">{v.code}</span>
							<span className="text-gray-400 dark:text-slate-500 truncate">{v.name}</span>
						</button>
					))}
				</div>,
				document.body
			)}
		</>
	);
}
