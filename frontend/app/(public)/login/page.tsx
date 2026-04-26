"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/provider/AuthProvider";

export default function LoginPage() {

	const { handleLogin, error } = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await handleLogin(email, password);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
		
		{/* Card */}
		<div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-8">
			
			{/* Header */}
			<div className="mb-8 text-center">
				<h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
					Axiom
				</h1>
				<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
					Sign in to continue
				</p>
			</div>

			{/* Error */}
			{error && (
				<div className="mb-5 p-3 rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm">
					{error}
				</div>
			)}

			{/* Form */}
			<form onSubmit={handleSubmit} className="space-y-5">
			
				{/* Email */}
				<div>
					<label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
						Email
					</label>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				{/* Password */}
				<div>
					<label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
						Password
					</label>

					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>

					<div className="mt-2 text-right">
						<Link
							href="/forgot-password"
							className="text-sm text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
						>
							Forgot password?
						</Link>
					</div>
				</div>

				{/* Button */}
				<button
					type="submit"
					className="w-full mt-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-medium py-2.5 rounded-lg"
				>
					Sign In
				</button>

			</form>

		</div>
		</div>
	);
}