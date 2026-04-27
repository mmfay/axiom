"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/provider/AuthProvider";

export default function ResetPasswordPage() {

	const { handleResetPassword } = useAuth();

	const searchParams = useSearchParams();
	const router = useRouter();

	const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {

		e.preventDefault();

		setError(null);
		setSuccess(null);

		if (!token) {
			setError("This reset link is invalid or missing a token.");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters.");
			return;
		}

		setLoading(true);

		try {
			
			await handleResetPassword( password, token )

			router.push("/login");

		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
			<div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-8">
				<div className="mb-8 text-center">
					<h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
						Axiom
					</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
						Create a new password
					</p>
				</div>

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

				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
							New Password
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
							Confirm Password
						</label>
						<input
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full mt-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
					>
						{loading ? "Resetting..." : "Reset Password"}
					</button>
				</form>

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