"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/provider/AuthProvider";
import Navbar from "@/app/components/Navbar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuth, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuth) {
      router.push("/login");
    }
  }, [isAuth, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }

  if (!isAuth) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
