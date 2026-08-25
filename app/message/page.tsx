"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getMyConversations, getMessagesBetween, markMessagesAsRead, sendMessage, getSellerProfile } from "@/lib/storage";

type Message = {
  id?: string;
  sender_email: string;
  receiver_email: string;
  product_id?: string;
  content: string;
  is_read?: boolean;
  created_at?: string;
};

type Conversation = {
  email: string;
  lastMessage: string;
  lastTime: string;
  unanswered: number;
};

type ContactProfile = {
  business_name?: string;
  logo_url?: string | null;
};

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-10 h-10 border-[3px] border-[#F97316] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MessagesPageInner />
    </Suspense>
  );
}

function MessagesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contactProfiles, setContactProfiles] = useState<Record<string, ContactProfile>>({});
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(function () {
    async function init() {
      const { data } = await supabase.auth.getUser();

      if (!data?.user) {
        router.push("/auth/login");
        return;
      }

      setUser(data.user);
      await loadConversations(data.user.email || "");
      setLoading(false);

      const toEmail = searchParams.get("to");
      if (toEmail && toEmail !== data.user.email) {
        openChat(toEmail);
      }
    }

    init();
  }, [router]);

  async function loadConversations(email: string) {
    try {
      const allMessages = await getMyConversations(email);
      if (!Array.isArray(allMessages)) return;

      const convMap: Record<string, Conversation> = {};

      allMessages.forEach(function (msg: Message) {
        const otherEmail = msg.sender_email === email ? msg.receiver_email : msg.sender_email;

        if (!convMap[otherEmail]) {
          convMap[otherEmail] = {
            email: otherEmail,
            lastMessage: msg.content,
            lastTime: msg.created_at || "",
            unanswered: 0,
          };
        }
      });

      Object.keys(convMap).forEach(function (otherEmail) {
        convMap[otherEmail].unanswered = countUnansweredMessages(allMessages, email, otherEmail);
      });

      const convList = Object.values(convMap);
      setConversations(convList);

      // Load each unique contact's real profile (business name + logo)
      // so the list shows a real company photo, never a generic icon,
      // whenever one is on file.
      const profiles: Record<string, ContactProfile> = {};
      await Promise.all(
        convList.map(async function (conv) {
          try {
            const profile = await getSellerProfile(conv.email);
            profiles[conv.email] = {
              business_name: profile?.business_name,
              logo_url: profile?.logo_url || null,
            };
          } catch (err) {
            console.error("Failed to load contact profile for", conv.email, err);
          }
        })
      );
      setContactProfiles(profiles);
    } catch (err) {
      console.error("loadConversations error:", err);
    }
  }

  // Unread count is derived fresh from the message list every time this
  // runs (called right after openChat marks messages read, and again on
  // return to the list). Since markMessagesAsRead updates is_read in the
  // database first, the next getMyConversations() fetch — which this
  // depends on — will correctly reflect zero unread for that contact
  // until a genuinely new message arrives after that point.
  function countUnansweredMessages(list: Message[], myEmail: string, otherEmail: string) {
    const conversationMessages = list
      .filter(function (msg) {
        return (
          (msg.sender_email === myEmail && msg.receiver_email === otherEmail) ||
          (msg.sender_email === otherEmail && msg.receiver_email === myEmail)
        );
      })
      .sort(function (a, b) {
        return new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime();
      });

    return conversationMessages.filter(function (msg) {
      return msg.sender_email === otherEmail && msg.receiver_email === myEmail && !msg.is_read;
    }).length;
  }

  async function openChat(otherEmail: string) {
    if (!user?.email && !otherEmail) return;

    setActiveChat(otherEmail);
    setLoadingMessages(true);

    try {
      const currentEmail = user?.email || (await supabase.auth.getUser()).data?.user?.email || "";
      const msgs = await getMessagesBetween(currentEmail, otherEmail);
      setMessages(Array.isArray(msgs) ? msgs : []);

      // Mark unread messages from this contact as read immediately on open.
      await markMessagesAsRead(currentEmail, otherEmail);

      // Refresh conversation list so the badge clears right away, even
      // before the user navigates back to the list view.
      await loadConversations(currentEmail);
    } catch (err) {
      console.error("openChat error:", err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleSend() {
    if (!newMessage.trim() || !activeChat || !user?.email) return;

    setSending(true);

    try {
      await sendMessage({
        sender_email: user.email,
        receiver_email: activeChat,
        content: newMessage.trim(),
      });

      setNewMessage("");
      await markMessagesAsRead(user.email, activeChat);
      await openChat(activeChat);
      await loadConversations(user.email);
    } catch (err) {
      console.error("handleSend error:", err);
    } finally {
      setSending(false);
    }
  }

  function formatTime(dateStr: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
  }

  function getInitial(email: string) {
    return email ? email.charAt(0).toUpperCase() : "?";
  }

  const filteredConversations = conversations.filter(function (conv) {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const profile = contactProfiles[conv.email];
    return (
      conv.email.toLowerCase().includes(q) ||
      (profile?.business_name || "").toLowerCase().includes(q) ||
      conv.lastMessage.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-[3px] border-[#F97316] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Chat view (a single open conversation) ──
  if (activeChat) {
    const profile = contactProfiles[activeChat];
    const businessName = profile?.business_name && profile.business_name !== activeChat ? profile.business_name : null;

    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0 border-b border-[#F3F4F6]">
          <button onClick={function () { setActiveChat(null); }} className="p-1 -ml-1 text-[#6B7280] hover:text-[#F97316] transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#F97316]">
            {profile?.logo_url ? (
              <img src={profile.logo_url} alt={activeChat} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xs font-black">{getInitial(businessName || activeChat)}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[#111827] text-sm truncate">{activeChat}</p>
            {businessName && <p className="text-[11px] text-[#6B7280] truncate">{businessName}</p>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-[2px] border-[#F97316] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <p className="text-[#9CA3AF] text-sm">No messages yet</p>
            </div>
          ) : (
            messages.map(function (msg, i) {
              const isMe = msg.sender_email === user.email;
              return (
                <div key={msg.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] sm:max-w-md flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-[#F97316] text-white rounded-tr-none" : "bg-[#F3F4F6] text-[#111827] rounded-tl-none"}`}>
                      <p className="leading-relaxed">{msg.content}</p>
                    </div>
                    <p className="text-[10px] text-[#9CA3AF] mt-1">{formatTime(msg.created_at || "")}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 py-3 border-t border-[#F3F4F6] flex-shrink-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Write a message..."
              value={newMessage}
              onChange={function (e) { setNewMessage(e.target.value); }}
              onKeyDown={function (e) {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 bg-[#F9FAFB] px-4 py-3 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#FB923C] transition"
            />
            <button
              onClick={handleSend}
              disabled={sending || !newMessage.trim()}
              className="w-11 h-11 bg-[#F97316] hover:bg-[#EA580C] disabled:bg-[#FED7AA] rounded-full flex items-center justify-center transition flex-shrink-0"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── List view ──
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto">

        {/* Top bar: back arrow left, search icon right */}
        <div className="flex items-center justify-between px-4 pt-5 pb-2">
          <button
            onClick={function () { router.back(); }}
            className="p-1 -ml-1 text-[#6B7280] hover:text-[#F97316] transition"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-base font-bold text-[#111827]">Messages</h1>
          <button
            onClick={function () {
              document.getElementById("messenger-search-input")?.focus();
            }}
            className="p-1 -mr-1 text-[#6B7280] hover:text-[#F97316] transition"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Full-width search bar, no border box */}
        <div className="px-4 pb-3">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="messenger-search-input"
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={function (e) { setSearchQuery(e.target.value); }}
              className="w-full pl-11 pr-4 py-3 bg-[#F9FAFB] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#FB923C] transition"
            />
          </div>
        </div>

        {/* Conversation list — flat, no card/border wrapper */}
        {filteredConversations.length === 0 ? (
          <div className="text-center py-20 px-6">
            <p className="text-[#6B7280] font-semibold text-sm mb-1">No chats</p>
            <p className="text-[#9CA3AF] text-xs">Your messages will appear here</p>
          </div>
        ) : (
          <div>
            {filteredConversations.map(function (conv) {
              const profile = contactProfiles[conv.email];
              const businessName = profile?.business_name && profile.business_name !== conv.email ? profile.business_name : null;

              return (
                <div
                  key={conv.email}
                  onClick={function () { openChat(conv.email); }}
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-[#F9FAFB] transition-colors border-b border-[#F3F4F6]"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#F97316]">
                    {profile?.logo_url ? (
                      <img src={profile.logo_url} alt={businessName || conv.email} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-sm font-black">{getInitial(businessName || conv.email)}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${conv.unanswered > 0 ? "font-bold text-[#111827]" : "font-semibold text-[#374151]"}`}>
                        {conv.email}
                      </p>
                      <span className="text-[11px] text-[#9CA3AF] flex-shrink-0 ml-2">{formatTime(conv.lastTime)}</span>
                    </div>

                    {businessName && (
                      <p className="text-xs text-[#9CA3AF] truncate">{businessName}</p>
                    )}

                    <div className="flex items-center justify-between mt-0.5">
                      <p className={`text-xs truncate ${conv.unanswered > 0 ? "text-[#111827] font-semibold" : "text-[#6B7280]"}`}>
                        {conv.lastMessage}
                      </p>
                      {conv.unanswered > 0 && (
                        <span className="ml-2 flex-shrink-0 min-w-5 h-5 px-1.5 bg-[#F97316] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                          {conv.unanswered}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}