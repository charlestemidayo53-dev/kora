import { supabase } from "@/lib/supabase";

export async function requireAdmin() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return { ok: false as const, redirectTo: "/auth/login" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user.id)
    .single();

  if (!profile?.is_admin) {
    return { ok: false as const, redirectTo: "/dashboard" };
  }

  return { ok: true as const, user: userData.user };
}