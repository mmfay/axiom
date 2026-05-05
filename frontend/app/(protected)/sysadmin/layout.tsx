"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/provider/AuthProvider";

export default function SysAdminLayout({ children }: { children: React.ReactNode }) {

	const { isSysAdmin, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && !isSysAdmin) {
			router.replace("/home");
		}
	}, [loading, isSysAdmin, router]);

	if (loading || !isSysAdmin) return null;

	return <>{children}</>;
	
}
