"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(function () {
    async function check() {
      const result = await requireAdmin();
      if (!result.ok) {
        router.push(result.redirectTo);
        return;
      }
      setAuthorized(true);
      setLoading(false);
    }
    check();
  }, [router]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0faf4]">
        <div className="w-10 h-10 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0faf4] p-6">
      <h1 className="text-2xl font-black text-[#1a4731]">Admin Dashboard</h1>
      <p className="text-gray-500 text-sm mt-1">Access confirmed. Stats and management sections coming next.</p>
    </div>
  );
}