"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/provider/AuthProvider";

export default function VerifyAccountPage() {

	const { handleVerifyAccount } = useAuth();

	const searchParams = useSearchParams();
	const router = useRouter();

	const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	useEffect(() => {

		const verifyAccount = async () => {

			if (!token) {
				setError("This verification link is invalid or missing a token.");
				setLoading(false);
				return;
			}

			try {
				
				await handleVerifyAccount(token);

				setTimeout(() => {
					router.push("/login");
				}, 2000);

			} catch (err) {
				setError(err instanceof Error ? err.message : "Something went wrong.");
			} finally {
				setLoading(false);
			}
		};

		verifyAccount();

	}, [token, router]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
			<div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-8">
				<div className="mb-8 text-center">
					<h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
						Axiom
					</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
						Verifying your account
					</p>
				</div>

				{loading && (
					<div className="mb-5 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm text-center">
						Checking your verification link...
					</div>
				)}

				{error && (
					<div className="mb-5 p-3 rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm">
						{error}
					</div>
				)}

				{success && (
					<div className="mb-5 p-3 rounded-lg border border-green-300 bg-green-50 text-green-700 text-sm">
						{success}
					</div>
				)}

				<div className="mt-5 text-center">
					<Link
						href="/login"
						className="text-sm text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
					>
						Back to Sign In
					</Link>
				</div>
			</div>
		</div>
	);
}