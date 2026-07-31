// lib/payments/flutterwave-server.ts
//
// Server-only. Never import this file from a client component or a
// "use client" file — it reads FLUTTERWAVE_SECRET_KEY, which must never
// reach the browser bundle. Only app/api/payments/* routes should import it.

const FLW_BASE_URL = "https://api.flutterwave.com/v3";

export type FlutterwaveVerifyResult = {
  id: number;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  currency: string;
  status: string; // "successful" | "failed" | "pending" | ...
  customer: { email: string; name?: string };
};

/**
 * Calls Flutterwave's GET /transactions/:id/verify endpoint using the
 * secret key. Throws if the request fails or Flutterwave itself reports
 * an error — callers should treat any thrown error as "do not fulfill".
 */
export async function verifyFlutterwaveTransaction(
  transactionId: string
): Promise<FlutterwaveVerifyResult> {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("FLUTTERWAVE_SECRET_KEY is not configured on the server.");
  }

  const res = await fetch(`${FLW_BASE_URL}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${secretKey}` },
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok || json.status !== "success" || !json.data) {
    throw new Error(json.message || "Flutterwave could not verify this transaction.");
  }

  return json.data as FlutterwaveVerifyResult;
}