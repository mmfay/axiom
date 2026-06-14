"use client";

import { useEffect, useState } from "react";
import { getAllRoles } from "../api/permissions";
import { ApiResponse } from "../api/response";
import { RoleOption } from "../types/roles";

export type RolesDetail = {
	roles: RoleOption[];
	loading: boolean;
	error: string | null;
};

export function useRolesDetail(): RolesDetail {

	const [roles, setRoles] = useState<RoleOption[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {

		async function load() {
			const res = ApiResponse.handle(await getAllRoles());
			if (res.ok && res.data) setRoles(res.data);
			else setError(res.message ?? "Failed to load roles");
			setLoading(false);
		}

		load();

	}, []);

	return { roles, loading, error };

}