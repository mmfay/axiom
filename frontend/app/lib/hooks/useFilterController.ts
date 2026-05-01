"use client";

import { useState } from "react";

export type FilterController = {
	open: boolean;
	onOpen: () => void;
	onClose: () => void;
}
export function useFilterController(): FilterController {

	const [open, setOpen] = useState(false);

	function onOpen() {
		setOpen(true);
	}

	function onClose() {
		setOpen(false);
	}

	// make accessible outside of controller
	return {
		open,
		onOpen,
		onClose
	};
}