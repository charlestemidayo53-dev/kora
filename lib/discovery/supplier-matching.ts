// lib/discovery/supplier-matching.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NormalizedProduct } from "./types";

export interface SupplierMatchResult {
  ownerEmail: string | null;
  isClaimed: boolean;
}

export async function matchSupplier(
  supabase: SupabaseClient,
  product: NormalizedProduct
): Promise<SupplierMatchResult> {
  if (product.supplierEmail) {
    const { data } = await supabase
      .from("profiles")
      .select("email")
      .ilike("email", product.supplierEmail)
      .maybeSingle();
    if (data?.email) return { ownerEmail: data.email, isClaimed: true };
  }

  if (product.supplierPhone) {
    const { data } = await supabase
      .from("profiles")
      .select("email")
      .eq("phone", product.supplierPhone)
      .maybeSingle();
    if (data?.email) return { ownerEmail: data.email, isClaimed: true };
  }

  if (product.supplierName) {
    const { data } = await supabase
      .from("profiles")
      .select("email")
      .or(`company_name.ilike.${product.supplierName.trim()},full_name.ilike.${product.supplierName.trim()}`)
      .maybeSingle();
    if (data?.email) return { ownerEmail: data.email, isClaimed: true };
  }

  return { ownerEmail: null, isClaimed: false };
}

export async function ensureClaimInvite(
  supabase: SupabaseClient,
  productId: string,
  product: NormalizedProduct
) {
  if (!product.supplierPhone && !product.supplierEmail) return;

  const { data: existing } = await supabase
    .from("supplier_claim_invites")
    .select("id")
    .eq("product_id", productId)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) return;

  await supabase.from("supplier_claim_invites").insert({
    product_id: productId,
    contact_phone: product.supplierPhone,
    contact_email: product.supplierEmail,
    status: "pending",
  });
}
