"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type Item = { id: string; name: string };
type Props = { supplierName: string; products: Item[] };
type Status = "idle" | "sending" | "sent" | "login" | "error";

export default function RequestQuote({ supplierName, products }: Props) {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState(products.length ? products[0].id : "");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  if (products.length === 0) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity, location, message }),
      });
      if (res.status === 401) {
        setStatus("login");
        return;
      }
      const data = await res.json().catch(function () { return {}; });
      if (!res.ok) {
        setError(data.error || "Could not send your request. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("sent");
      setQuantity("");
      setLocation("");
      setMessage("");
    } catch {
      setError("Network problem. Please try again.");
      setStatus("error");
    }
  }

  const field =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#F97316] focus:outline-none";
  const label = "block text-xs font-medium text-gray-600 mb-1";

  if (status === "sent") {
    return (
      <div className="mb-6 max-w-xl rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-semibold text-green-700">Your quote request was sent to {supplierName}.</p>
        <p className="text-xs text-gray-600 mt-1">They can respond to you through Kora.</p>
        <button
          type="button"
          onClick={function () { setStatus("idle"); setOpen(false); }}
          className="mt-3 text-xs font-semibold text-[#F97316] hover:text-[#c2410c]"
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 max-w-xl">
      {!open ? (
        <button
          type="button"
          onClick={function () { setOpen(true); }}
          className="px-4 py-2 rounded-lg border border-[#F97316] text-[#F97316] text-sm font-semibold hover:bg-[#F97316] hover:text-white transition"
        >
          Request a bulk quote
        </button>
      ) : (
        <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <h2 className="text-sm font-bold text-gray-900">Request a quote from {supplierName}</h2>
          <div>
            <label htmlFor="rq-product" className={label}>Product</label>
            <select id="rq-product" value={productId} onChange={function (e) { setProductId(e.target.value); }} className={field}>
              {products.map(function (p) {
                return <option key={p.id} value={p.id}>{p.name}</option>;
              })}
            </select>
          </div>
          <div>
            <label htmlFor="rq-qty" className={label}>Quantity needed</label>
            <input id="rq-qty" required maxLength={60} value={quantity} onChange={function (e) { setQuantity(e.target.value); }} placeholder="e.g. 5 tonnes" className={field} />
          </div>
          <div>
            <label htmlFor="rq-loc" className={label}>Delivery location</label>
            <input id="rq-loc" maxLength={120} value={location} onChange={function (e) { setLocation(e.target.value); }} placeholder="City or state" className={field} />
          </div>
          <div>
            <label htmlFor="rq-msg" className={label}>Details (optional)</label>
            <textarea id="rq-msg" rows={3} maxLength={1000} value={message} onChange={function (e) { setMessage(e.target.value); }} className={field} />
          </div>
          {status === "login" && (
            <p className="text-xs text-gray-700">
              Please <Link href="/auth/login" className="font-semibold text-[#F97316]">log in</Link> to send your request.
            </p>
          )}
          {status === "error" && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={status === "sending"}
              className="px-4 py-2 rounded-lg bg-[#F97316] text-white text-sm font-semibold hover:bg-[#c2410c] transition disabled:opacity-60"
            >
              {status === "sending" ? "Sending..." : "Send request"}
            </button>
            <button
              type="button"
              onClick={function () { setOpen(false); }}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}