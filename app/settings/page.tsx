"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  useEffect(function () {
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/auth/login";
        return;
      }
      setUser(data.user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, company_name, avatar_url, role")
        .eq("id", data.user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setCompanyName(profile.company_name || "");
        setAvatarUrl(profile.avatar_url || "");
        setRole(profile.role || "buyer");
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be under 5MB.");
      setMessageType("error");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl + "?t=" + Date.now();

      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);

      setAvatarUrl(publicUrl);
      setMessage("Profile photo updated.");
      setMessageType("success");
    } catch (err: any) {
      setMessage(err.message || "Upload failed.");
      setMessageType("error");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, company_name: companyName })
        .eq("id", user.id);

      if (error) throw error;
      setMessage("Profile updated successfully.");
      setMessageType("success");
    } catch (err: any) {
      setMessage(err.message || "Failed to save changes.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordReset() {
    if (!user?.email) return;
    setMessage("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin + "/auth/reset-password",
      });
      if (error) throw error;
      setMessage("Password reset link sent to your email.");
      setMessageType("success");
    } catch (err: any) {
      setMessage(err.message || "Failed to send reset link.");
      setMessageType("error");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-[#F97316] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-3xl font-bold text-[#111827] mb-2">Profile Settings</h1>
        <p className="text-[#6B7280] mb-10">Manage your personal information and account security</p>

        {message && (
          <div
            className={
              "mb-8 p-4 rounded-lg text-sm font-semibold border " +
              (messageType === "success"
                ? "bg-green-50 text-[#16A34A] border-green-100"
                : "bg-red-50 text-[#DC2626] border-red-100")
            }
          >
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 mb-8">

          {/* Avatar upload */}
          <div className="flex items-center gap-6 mb-10 pb-10 border-b border-[#E5E7EB]">
            <div className="w-24 h-24 rounded-full bg-[#F9FAFB] border border-[#E5E7EB] overflow-hidden flex items-center justify-center flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-10 h-10 text-[#E5E7EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div>
              <label className="inline-block bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold px-6 py-3 rounded-lg cursor-pointer transition shadow-sm hover:shadow-md">
                {uploading ? "Uploading..." : "Change Photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-[#6B7280] mt-3">Square JPG or PNG. Max 5MB.</p>
            </div>
          </div>

          {/* Edit form */}
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={function (e) { setFullName(e.target.value); }}
                placeholder="Your name"
                className="w-full bg-white px-4 py-3 rounded-lg text-sm border border-[#E5E7EB] focus:ring-2 focus:ring-[#FB923C] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={function (e) { setCompanyName(e.target.value); }}
                placeholder="Business name (optional)"
                className="w-full bg-white px-4 py-3 rounded-lg text-sm border border-[#E5E7EB] focus:ring-2 focus:ring-[#FB923C] outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-[#F9FAFB] px-4 py-3 rounded-lg text-sm border border-[#E5E7EB] text-[#6B7280] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  Account Type
                </label>
                <input
                  type="text"
                  value={role.charAt(0).toUpperCase() + role.slice(1)}
                  disabled
                  className="w-full bg-[#F9FAFB] px-4 py-3 rounded-lg text-sm border border-[#E5E7EB] text-[#6B7280] cursor-not-allowed capitalize"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#F97316] hover:bg-[#EA580C] disabled:bg-[#FED7AA] text-white py-4 rounded-lg font-bold text-sm transition shadow-sm hover:shadow-md"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Security section */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8">
          <h2 className="text-xl font-bold text-[#111827] mb-2">Security</h2>
          <p className="text-sm text-[#6B7280] mb-8">Manage your password and account access</p>
          <button
            onClick={handlePasswordReset}
            className="w-full sm:w-auto border border-[#E5E7EB] hover:border-[#F97316] text-[#6B7280] hover:text-[#F97316] px-8 py-3 rounded-lg font-bold text-sm transition"
          >
            Send Password Reset Link
          </button>
        </div>
      </div>
    </div>
  );
}
