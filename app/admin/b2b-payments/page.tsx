"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import { confirmMilestonePayment, rejectMilestonePayment } from "@/lib/b2b";

export default function AdminB2BPaymentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [claims, setClaims] = useState<any[]>([]);
  const [actingId, setActingId] = useState<string | null>(null);

  async function loadClaims() {
    const { data } = await supabase
      .from("b2b_payment_milestones")
      .select("*, b2b_orders(product_description, buyer_email, seller_email)")
      .eq("status", "submitted")
      .order("submitted_at", { ascending: true });
    setClaims(data || []);
  }

  useEffect(function () {
    async function init() {
      const result = await requireAdmin();
      if (!result.ok) { router.push(result.redirectTo); return; }
      setAdminEmail(result.user.email || "");
      await loadClaims();
      setLoading(false);
    }
    init();
  }, [router]);

  async function handleConfirm(id: string) {
    setActingId(id);
    try {
      await confirmMilestonePayment(id, adminEmail);
      await loadClaims();
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(id: string) {
    setActingId(id);
    try {
      await rejectMilestonePayment(id, adminEmail);
      await loadClaims();
    } finally {
      setActingId(null);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-[3px] border-gray-400 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-black text-gray-900 mb-6">B2B Bank Transfer Claims</h1>

        {claims.length === 0 ? (
          <p className="text-gray-400 text-sm">No pending claims.</p>
        ) : (
          <div className="space-y-4">
            {claims.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="font-bold text-gray-900">{c.b2b_orders?.product_description}</p>
                <p className="text-sm text-gray-500 mt-1">Buyer: {c.b2b_orders?.buyer_email} → Seller: {c.b2b_orders?.seller_email}</p>
                <p className="text-sm text-gray-700 mt-2">Milestone: <span className="font-semibold">{c.label}</span> — ₦{Number(c.amount).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Claimed reference: {c.proof_reference}</p>
                <p className="text-xs text-gray-400">Submitted by {c.submitted_by} on {new Date(c.submitted_at).toLocaleString()}</p>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleConfirm(c.id)}
                    disabled={actingId === c.id}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                  >
                    Confirm Payment Received
                  </button>
                  <button
                    onClick={() => handleReject(c.id)}
                    disabled={actingId === c.id}
                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-xs font-bold transition"
                  >
                    Reject Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
