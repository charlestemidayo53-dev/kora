// lib/payments/flutterwave-client.ts
"use client";

export type FlutterwaveCheckoutInput = {
  txRef: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  description?: string;
};

/**
 * Builds the config object flutterwave-react-v3's useFlutterwave hook
 * expects. Kept separate from any single page so other "Pay" buttons added
 * later (cart checkout, RFQ deposits, subscription plans, etc.) can reuse
 * this instead of redefining the same shape inline each time.
 *
 * Only ever reads NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY — the public key is
 * safe in client bundles by design; the secret key never appears here.
 */
export function buildFlutterwaveConfig({
  txRef,
  amount,
  currency,
  customerEmail,
  customerName,
  description,
}: FlutterwaveCheckoutInput) {
  return {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY as string,
    tx_ref: txRef,
    amount,
    currency,
    payment_options: "card,mobilemoney,ussd,banktransfer",
    customer: {
      email: customerEmail,
      name: customerName,
    },
    customizations: {
      title: "Kora Marketplace",
      description: description || "Payment for marketplace order",
      logo: "/kora-logo.png",
    },
  };
}