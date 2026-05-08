import { getJSON, patchJSON, postJSON } from "./submissions";
import { APIResult } from "../types/data";
import { GLDimension, GLDimensionCreate, GLDimensionPatch, GLDimensionValue, GLDimensionValueCreate, GLDimensionValuePatch } from "../types/gl_dimensions";

export async function getGLDimensions(): Promise<APIResult<GLDimension[]>> {
	return getJSON("/gl/dimensions");
}

export async function createGLDimension(body: GLDimensionCreate): Promise<APIResult<GLDimension>> {
	return postJSON("/gl/dimensions", body);
}

export async function updateGLDimension(dimensionId: number, patch: GLDimensionPatch): Promise<APIResult<GLDimension>> {
	return patchJSON(`/gl/dimensions/${dimensionId}`, patch);
}

export async function getGLDimensionValues(dimensionId: number): Promise<APIResult<GLDimensionValue[]>> {
	return getJSON(`/gl/dimensions/${dimensionId}/values`);
}

export async function createGLDimensionValue(dimensionId: number, body: GLDimensionValueCreate): Promise<APIResult<GLDimensionValue>> {
	return postJSON(`/gl/dimensions/${dimensionId}/values`, body);
}

export async function updateGLDimensionValue(dimensionId: number, valueId: number, patch: GLDimensionValuePatch): Promise<APIResult<GLDimensionValue>> {
	return patchJSON(`/gl/dimensions/${dimensionId}/values/${valueId}`, patch);
}
