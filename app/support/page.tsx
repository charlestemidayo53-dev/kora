"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: "open" | "pending" | "resolved";
  admin_reply?: string | null;
  created_at: string;
};

const inputClass = "w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c] focus:border-transparent transition";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

function statusBadge(status: string) {
  if (status === "resolved") return "bg-green-100 text-green-700";
  if (status === "pending") return "bg-amber-100 text-amber-700";
  return "bg-blue-100 text-blue-700";
}

export default function SupportPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(function () {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/auth/login");
        return;
      }
      setUser(data.user);
      await loadTickets(data.user.id);
      setLoading(false);
    }
    init();
  }, [router]);

  async function loadTickets(userId: string) {
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setTickets(Array.isArray(data) ? data : []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!subject.trim() || !message.trim()) {
      setError("Please fill in both a subject and your message.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from("support_tickets").insert([
        {
          user_id: user.id,
          user_email: user.email,
          subject: subject.trim(),
          message: message.trim(),
          status: "open",
        },
      ]);

      if (insertError) throw insertError;

      setSuccess(true);
      setSubject("");
      setMessage("");
      await loadTickets(user.id);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff7ed]">
        <div className="w-10 h-10 border-4 border-[#ea580c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff7ed]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#ea580c] transition text-sm font-medium mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard
        </button>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-[#c2410c] mb-1">Customer Support</h1>
          <p className="text-gray-500 text-xs sm:text-sm mb-5">
            Submit a question, complaint, or report a problem. Our team will respond as soon as possible.
          </p>

          {success && (
            <div className="bg-[#fff7ed] border border-[#fed7aa] text-[#ea580c] text-sm px-4 py-3 rounded-xl mb-4 font-semibold">
              Your request has been submitted. You'll see our reply below once we respond.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Subject</label>
              <input
                className={inputClass}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Payment not reflecting in my order"
              />
            </div>
            <div>
              <label className={labelClass}>Message</label>
              <textarea
                rows={4}
                className={inputClass + " resize-none"}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question, complaint, or the problem you're facing..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#ea580c] hover:bg-[#c2410c] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold text-sm transition shadow-md"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>

        {tickets.length > 0 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Your Support Tickets</h2>
            <div className="space-y-4">
              {tickets.map(function (ticket) {
                return (
                  <div key={ticket.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                      <h3 className="font-bold text-gray-800 text-sm">{ticket.subject}</h3>
                      <span className={"px-2.5 py-1 rounded-full text-[10px] font-bold uppercase " + statusBadge(ticket.status)}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-700 mb-3">{ticket.message}</p>

                    {ticket.admin_reply && (
                      <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-lg p-3 mt-2">
                        <p className="text-[10px] font-bold text-[#ea580c] uppercase tracking-wide mb-1">Support Team Reply</p>
                        <p className="text-sm text-gray-700">{ticket.admin_reply}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
