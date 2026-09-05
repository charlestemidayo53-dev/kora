// app/api/discovery/claim/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Cookie writes may be unavailable in some server contexts.
        }
      },
    },
  },
);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { inviteToken } = await req.json();
  if (!inviteToken) return NextResponse.json({ error: "inviteToken is required" }, { status: 400 });

  const { data: invite, error: inviteError } = await supabase
    .from("supplier_claim_invites")
    .select("id, product_id, status")
    .eq("invite_token", inviteToken)
    .single();

  if (inviteError || !invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  if (invite.status === "claimed") return NextResponse.json({ error: "Already claimed" }, { status: 409 });

  const { error: productError } = await supabase
    .from("products")
    .update({ owner: user.email, is_claimed: true })
    .eq("id", invite.product_id);

  if (productError) return NextResponse.json({ error: productError.message }, { status: 500 });

  await supabase
    .from("supplier_claim_invites")
    .update({ status: "claimed", claimed_by_email: user.email, claimed_at: new Date().toISOString() })
    .eq("id", invite.id);

  return NextResponse.json({ ok: true });
}

