"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/provider/AuthProvider";

export default function SignupPage() {

	const { handleSignup, error } = useAuth();
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [userId, setUserId] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		await handleSignup(userId, email, "", "", password);

		// you can also move this into AuthProvider later
		router.push("/");
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
				Create your account
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

			{/* User ID */}
			<div>
				<label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
				User ID
				</label>
				<input
				type="text"
				value={userId}
				onChange={(e) => setUserId(e.target.value)}
				required
				className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>

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
			</div>

			{/* Button */}
			<button
				type="submit"
				className="w-full mt-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-medium py-2.5 rounded-lg"
			>
				Sign Up
			</button>
			</form>

			{/* Footer */}
			<div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
			Already have an account?{" "}
			<span
				onClick={() => router.push("/login")}
				className="text-blue-600 hover:underline cursor-pointer"
			>
				Sign in
			</span>
			</div>

		</div>
		</div>
	);
}