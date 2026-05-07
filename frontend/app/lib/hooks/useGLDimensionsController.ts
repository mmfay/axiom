"use client";

import { useCallback, useEffect, useState } from "react";
import { getGLDimensions, createGLDimension, updateGLDimension } from "../api/gl_dimensions";
import { GLDimension, GLDimensionCreate, GLDimensionPatch } from "../types/gl_dimensions";
import { ApiResponse } from "../api/response";

export type GLDimensionsController = {
	dimensions: GLDimension[];
	loading: boolean;
	error: string | null;
	onCreate: (data: GLDimensionCreate) => Promise<GLDimension>;
	onUpdate: (dimensionId: number, patch: GLDimensionPatch) => Promise<GLDimension>;
};

export function useGLDimensionsController(): GLDimensionsController {

	const [dimensions, setDimensions] = useState<GLDimension[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const reload = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = ApiResponse.handle(await getGLDimensions());
			if (!res.ok || !res.data) { setError(res.message); return; }
			setDimensions(res.data);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to load dimensions");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { reload(); }, [reload]);

	const onCreate = useCallback(async (data: GLDimensionCreate): Promise<GLDimension> => {
		const res = ApiResponse.handle(await createGLDimension(data));
		if (!res.ok || !res.data) throw new Error(res.message ?? "Failed to create dimension");
		const created = res.data;
		setDimensions((prev) => [...prev, created]);
		return created;
	}, []);

	const onUpdate = useCallback(async (dimensionId: number, patch: GLDimensionPatch): Promise<GLDimension> => {
		const res = ApiResponse.handle(await updateGLDimension(dimensionId, patch));
		if (!res.ok || !res.data) throw new Error(res.message ?? "Failed to update dimension");
		const updated = res.data;
		setDimensions((prev) => prev.map((d) => (d.id === dimensionId ? updated : d)));
		return updated;
	}, []);

	return { dimensions, loading, error, onCreate, onUpdate };
}
