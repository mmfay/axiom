"use client";

import { useAuth } from "@/app/provider/AuthProvider";

export function usePermission(name: string): boolean {
	const { hasPermission } = useAuth();
	return hasPermission(name);
}
