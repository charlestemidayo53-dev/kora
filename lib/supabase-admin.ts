// lib/supabase-admin.ts
// SERVER ONLY. Uses the Supabase service-role key, which bypasses RLS.
// Never import this from a "use client" file. "server-only" makes the build fail if you do.
import "server-only";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase admin client is not configured.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Returns the signed-in user for a request carrying "Authorization: Bearer <access token>",
 * or null. The token is validated by Supabase, never trusted from the client.
 */
export async function getAuthenticatedUser(req: Request): Promise<User | null> {
  const header = req.headers.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return null;
  const token = match[1].trim();
  if (!token) return null;

  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}
