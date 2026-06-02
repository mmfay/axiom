import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function fetchSession(sid: string) {
	const res = await fetch(`${API_BASE_URL}/auth/me`, {
		headers: { Cookie: `sid=${sid}` },
	});
	const body = await res.json();
	return { ok: res.ok, data: body?.data };
}

export async function proxy(request: NextRequest) {

	const sid = request.cookies.get("sid");

	if (!sid?.value) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	const path = request.nextUrl.pathname;

	try {

		const { ok, data } = await fetchSession(sid.value);

		if (!ok) {
			return NextResponse.redirect(new URL("/login", request.url));
		}

		if (path.startsWith("/sysadmin")) {
			if (data?.active_role?.name !== "sysadmin") {
				return NextResponse.redirect(new URL("/home", request.url));
			}
		}

		if (path.startsWith("/gl")) {
			const isSysAdmin = data?.active_role?.name === "sysadmin";
			const permissions: { name: string }[] = data?.active_role_permissions ?? [];
			const hasRead = isSysAdmin || permissions.some((p) => p.name === "General_ledger.Read");
			if (!hasRead) {
				return NextResponse.redirect(new URL("/home", request.url));
			}
		}

	} catch {
		return NextResponse.redirect(new URL("/home", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/sysadmin/:path*", "/gl/:path*"],
};
