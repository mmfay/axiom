"use client";

import { useState } from "react";

export type FilterField = {
	id: string;
	label: string;
	type: "text" | "boolean";
};

export type FilterController = {
	open: boolean;
	onOpen: () => void;
	onClose: () => void;
	fields: FilterField[];
	filters: Record<string, string>;
	activeCount: number;
	onApply: (next: Record<string, string>) => void;
	onClear: () => void;
};

export function useFilterController(fields: FilterField[]): FilterController {
	
	const [open, setOpen] = useState(false);
	const [filters, setFilters] = useState<Record<string, string>>({});

	const activeCount = Object.values(filters).filter(Boolean).length;

	function onOpen() { setOpen(true); }
	function onClose() { setOpen(false); }

	function onApply(next: Record<string, string>) {
		setFilters(next);
		setOpen(false);
	}

	function onClear() {
		setFilters({});
		setOpen(false);
	}

	return { open, onOpen, onClose, fields, filters, activeCount, onApply, onClear };
}