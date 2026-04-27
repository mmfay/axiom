"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { login, signup, logout, forgotPassword, resetPassword, verifyAccount, me } from "../lib/api/auth";

export type Company = {
	id: number;
	name: string;
};

export type AuthUser = {
	id: string;
	user_id: string;
	email: string;
	tenant_id: number;
	company_id: number | null;
	companies: Company[];
};

export type AuthState = {
	isAuth: boolean;
	user: AuthUser | null;
	loading: boolean;
};

export type AuthContextValue = AuthState & {

	error: string | null;
	handleLogin: (email: string, password: string) => Promise<void>;
	handleSignup: (user_id: string, email: string, first_name: string, last_name: string, password: string) => Promise<void>;
	handleLogout: () => Promise<void>;
	handleForgotPassword: (email: string) => Promise<void>;
	handleResetPassword: (newPassword: string, token: string) => Promise<void>;
	handleVerifyAccount: (token: string) => Promise<void>;
	refresh: () => Promise<void>;

};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	
	const [user, setUser] = useState<AuthUser | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const isAuth = !!user;

	const router = useRouter();

	// refresh calls me which gets user info if session is still valid. 
	const refresh = async () => {
		
		setLoading(true);

		try {

			const res = await me(); 

			if (!res.ok) {
				setUser(null);
				return;
			}

			const user = res.data;

			if (user) {
				setUser(user);
			} else {
				setUser(null);
			}

		} finally {

			setLoading(false);

		}
		
	};

	useEffect(() => {

		// On initial app load, check if cookie/session is valid
		refresh();

	}, []);

  	// login function
	const handleLogin = async (email: string, password: string) => {

		try {
			setError(null);
			const res = await login({ email, password });

			if (!res.ok) {
				setError(res.message);
				return;
			}

			// set the user
			await refresh();

			// route to home
			router.push("/home");

		} finally {

			setLoading(false);

		}

	};

  	// signup function
	const handleSignup = async (user_id: string, email: string, first_name: string, last_name: string, password: string) => {

		setLoading(true);

		try {

			const res = await signup({ user_id, email, first_name, last_name, password })

			if (!res.ok) {
				throw new Error(res.message ?? "Signup failed");
			}

			router.push('/login');

		} finally {

			setLoading(false);

		}

	};

  	// logout function
	const handleLogout = async () => {
		
		setLoading(true);

		try {

			await logout();

			setUser(null);

			router.push("/");

		} finally {

			setLoading(false);

		}
		
	};

	// forgot password 
	const handleForgotPassword = async (email: string) => {
		
		setLoading(true);

		try {

			await forgotPassword({ email })

		} finally {

			setLoading(false);

		}
		
	};

	// reset password 
	const handleResetPassword = async (password: string, token: string) => {
		
		setLoading(true);

		try {

			await resetPassword({ password, token })

			router.push("/login");

		} finally {

			setLoading(false);

		}
		
	};

	// verify account
	const handleVerifyAccount = async (token: string) => {
		
		setLoading(true);

		try {

			const res = await verifyAccount({ token })

			if (!res.ok) {
				alert("hey");
				return;
			}

			router.push("/login");

		} finally {

			setLoading(false);

		}
		
	};

	const value: AuthContextValue = useMemo(() => (
		{ 
			isAuth, 
			user, 
			error, 
			loading, 
			handleLogin, 
			handleSignup, 
			handleLogout, 
			handleForgotPassword, 
			handleResetPassword, 
			handleVerifyAccount,
			refresh 
		}),
		[isAuth, user, error, loading]
	);

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);

}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
	return ctx;
}
