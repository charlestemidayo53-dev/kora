"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { updateProfileAvatar, uploadProfileImage } from "@/lib/storage";

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(function () {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/auth/login");
        return;
      }

      setUser(data.user);
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, company_name, avatar_url")
        .eq("id", data.user.id)
        .single();

      setProfile(p || null);
      setLoading(false);
    }

    checkUser();
  }, [router]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setUploadingAvatar(true);
    try {
      const avatarUrl = await uploadProfileImage(file, user.id);
      if (!avatarUrl) {
        alert("Could not upload profile picture. Please try again.");
        return;
      }

      await updateProfileAvatar(user.id, avatarUrl);
      setProfile(function (current: any) {
        return { ...(current || {}), avatar_url: avatarUrl };
      });
    } catch (err) {
      console.error("Profile image upload failed:", err);
      alert("Could not update profile picture. Please try again.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const avatarUrl = profile?.avatar_url || null;

  const menuItems = [
    { label: "Manage Orders", href: "/orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { label: "Messenger", href: "/message", icon: "M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
    { label: "My Products", href: "/dashboard", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" },
    { label: "Escrow Balance", href: "/escrow", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
    { label: "Total Sales", href: "/orders", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Marketplace", href: "/marketplace", icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" },
    { label: "Add Product", href: "/add-product", icon: "M12 4v16m8-8H4" },
    { label: "Seller Dashboard", href: "/seller-dashboard", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { label: "My Profile", href: "/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Simplified header: single avatar/icon button, no name or welcome text */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <button
          type="button"
          onClick={function () { fileInputRef.current?.click(); }}
          disabled={uploadingAvatar}
          aria-label={avatarUrl ? "Change profile picture" : "Upload profile picture"}
          className="relative w-12 h-12 rounded-full overflow-hidden bg-[#f0faf4] ring-1 ring-gray-200 flex items-center justify-center transition hover:ring-[#2e8b5a] disabled:opacity-60"
        >
          {uploadingAvatar ? (
            <span className="w-4 h-4 border-2 border-[#2e8b5a] border-t-transparent rounded-full animate-spin" />
          ) : avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-6 h-6 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>

      <div>
        {menuItems.map(function (item) {
          return (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-4 px-4 py-4 border-b border-gray-50 hover:bg-gray-50 transition"
            >
              <svg className="w-5 h-5 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
              </svg>
              <span className="flex-1 text-sm text-gray-800">{item.label}</span>
              <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          );
        })}

        <button
          onClick={async function () {
            await supabase.auth.signOut();
            router.push("/auth/login");
          }}
          className="w-full flex items-center gap-4 px-4 py-4 border-b border-gray-50 hover:bg-red-50 transition text-left"
        >
          <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="flex-1 text-sm text-red-500 font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}