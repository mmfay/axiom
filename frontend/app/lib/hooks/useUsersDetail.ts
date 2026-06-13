"use client";

import { useEffect, useState } from "react";
import { getAllUsers } from "../api/users";
import { ApiResponse } from "../api/response";
import { UserOption } from "../types/users";

export type UsersDetail = {
	users: UserOption[];
	loading: boolean;
	error: string | null;
};

export function useUsersDetail(): UsersDetail {

	const [users, setUsers] = useState<UserOption[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {

		async function load() {
			const res = ApiResponse.handle(await getAllUsers());
			if (res.ok && res.data) setUsers(res.data);
			else setError(res.message ?? "Failed to load users");
			setLoading(false);
		}

		load();

	}, []);

	return { users, loading, error };
}