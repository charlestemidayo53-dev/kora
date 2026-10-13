// app/api/discovery/import/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { runAllDiscoverySources } from "@/lib/discovery/pipeline";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = process.env.DISCOVERY_CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  // Refuse to run at all if the secret is not configured.
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.DISCOVERY_ENABLED === "false") {
    return NextResponse.json({ skipped: true, reason: "DISCOVERY_ENABLED is false" });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Server is not configured." }, { status: 500 });
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const results = await runAllDiscoverySources(supabase);
    return NextResponse.json({ ok: true, results });
  } catch (err: any) {
    console.error("Discovery import failed:", err);
    return NextResponse.json({ ok: false, error: "Discovery import failed." }, { status: 500 });
  }
}
