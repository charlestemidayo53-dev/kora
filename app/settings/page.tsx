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
      <div className="min-h-screen bg-[#f0faf4] flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-[#2e8b5a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0faf4] py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-2xl font-black text-[#1a4731] mb-1">Profile Settings</h1>
        <p className="text-sm text-gray-500 mb-8">Manage your personal information and photo</p>

        {message && (
          <div
            className={
              "mb-5 p-3 rounded-xl text-xs font-bold border " +
              (messageType === "success"
                ? "bg-green-50 text-[#2e8b5a] border-green-100"
                : "bg-red-50 text-red-600 border-red-100")
            }
          >
            {message}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">

          {/* Avatar upload */}
          <div className="flex items-center gap-5 mb-8 pb-6 border-b border-gray-50">
            <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-9 h-9 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div>
              <label className="inline-block bg-[#2e8b5a] hover:bg-[#1a4731] text-white text-sm font-bold px-4 py-2.5 rounded-xl cursor-pointer transition">
                {uploading ? "Uploading..." : "Upload Photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-400 mt-2">JPG or PNG. Max 5MB.</p>
            </div>
          </div>

          {/* Edit form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={function (e) { setFullName(e.target.value); }}
                placeholder="Enter your full name"
                className="w-full bg-gray-50 px-4 py-3 rounded-xl text-sm border border-gray-200 focus:ring-2 focus:ring-[#2e8b5a] outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={function (e) { setCompanyName(e.target.value); }}
                placeholder="Enter your business name (optional)"
                className="w-full bg-gray-50 px-4 py-3 rounded-xl text-sm border border-gray-200 focus:ring-2 focus:ring-[#2e8b5a] outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full bg-gray-100 px-4 py-3 rounded-xl text-sm border border-gray-200 text-gray-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                Account Type
              </label>
              <input
                type="text"
                value={role.charAt(0).toUpperCase() + role.slice(1)}
                disabled
                className="w-full bg-gray-100 px-4 py-3 rounded-xl text-sm border border-gray-200 text-gray-400 capitalize"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-200 text-white py-3.5 rounded-xl font-black text-sm transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Security section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-black text-gray-800 mb-1">Security</h2>
          <p className="text-xs text-gray-400 mb-4">Manage your password and account access</p>
          <button
            onClick={handlePasswordReset}
            className="w-full sm:w-auto border border-gray-200 hover:border-[#2e8b5a] text-gray-700 hover:text-[#2e8b5a] px-5 py-2.5 rounded-xl font-bold text-sm transition"
          >
            Send Password Reset Link
          </button>
        </div>
      </div>
    </div>
  );
}