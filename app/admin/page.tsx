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
      <div className="min-h-screen flex items-center justify-center bg-[#fff7ed]">
        <div className="w-10 h-10 border-4 border-[#ea580c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff7ed] p-6">
      <h1 className="text-2xl font-black text-[#c2410c]">Admin Dashboard</h1>
      <p className="text-gray-500 text-sm mt-1">Access confirmed. Stats and management sections coming next.</p>
    </div>
  );
}
