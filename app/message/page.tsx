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

    const lastReplyIndex = conversationMessages
      .map(function (msg) { return msg.sender_email; })
      .lastIndexOf(myEmail);

    return conversationMessages
      .slice(lastReplyIndex + 1)
      .filter(function (msg) { return msg.sender_email === otherEmail && msg.receiver_email === myEmail; })
      .length;
  }

  async function openChat(otherEmail: string) {
    if (!user?.email && !otherEmail) return;

    setActiveChat(otherEmail);
    setLoadingMessages(true);

    try {
      const currentEmail = user?.email || (await supabase.auth.getUser()).data?.user?.email || "";
      const msgs = await getMessagesBetween(currentEmail, otherEmail);
      setMessages(Array.isArray(msgs) ? msgs : []);
      await markMessagesAsRead(currentEmail, otherEmail);
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
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6B7280] text-sm font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-6 sm:py-10">

        {/* Top bar: back arrow left, search icon right — only shown on the
            list view (mobile); on desktop the two-pane layout below still
            has its own search box. */}
        <div className={`flex items-center justify-between mb-6 ${activeChat ? "hidden sm:flex" : "flex"}`}>
          <button
            onClick={function () { router.back(); }}
            className="p-2 -ml-2 text-[#6B7280] hover:text-[#F97316] transition"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={function () {
              const el = document.getElementById("messenger-search-input");
              el?.focus();
            }}
            className="p-2 -mr-2 text-[#6B7280] hover:text-[#F97316] transition"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        <div className={`mb-8 ${activeChat ? "hidden sm:block" : "block"}`}>
          <h1 className="text-3xl font-bold text-[#111827] mb-2">Messages</h1>
          <p className="text-[#6B7280]">Secure communication with buyers and sellers</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden h-[75vh] sm:h-[650px] flex shadow-sm">
          {/* Sidebar */}
          <div className={`w-full sm:w-80 border-r border-[#E5E7EB] flex flex-col flex-shrink-0 ${activeChat ? "hidden sm:flex" : "flex"}`}>
            <div className="p-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  id="messenger-search-input"
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={function (e) { setSearchQuery(e.target.value); }}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#FB923C] transition"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-20 px-6">
                  <p className="text-[#6B7280] font-bold text-sm uppercase tracking-wider mb-2">No chats</p>
                  <p className="text-[#9CA3AF] text-xs">Your messages will appear here</p>
                </div>
              ) : (
                filteredConversations.map(function (conv) {
                  const isActive = activeChat === conv.email;
                  const profile = contactProfiles[conv.email];
                  const businessName = profile?.business_name;
                  const showBusinessName = businessName && businessName !== conv.email;

                  return (
                    <div
                      key={conv.email}
                      onClick={function () { openChat(conv.email); }}
                      className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors border-b border-[#F9FAFB] ${isActive ? "bg-[#FFF7ED] border-r-4 border-r-[#F97316]" : "hover:bg-[#F9FAFB]"}`}
                    >
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden bg-[#F97316]">
                        {profile?.logo_url ? (
                          <img src={profile.logo_url} alt={businessName || conv.email} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-sm font-black">{getInitial(businessName || conv.email)}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className={`text-sm truncate ${conv.unanswered > 0 ? "font-black text-[#111827]" : "font-bold text-[#374151]"}`}>
                            {conv.email}
                          </p>
                          <span className="text-[10px] font-bold text-[#9CA3AF] flex-shrink-0 ml-2">{formatTime(conv.lastTime)}</span>
                        </div>

                        {showBusinessName && (
                          <p className="text-xs text-[#9CA3AF] truncate mb-0.5">{businessName}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <p className={`text-xs truncate ${conv.unanswered > 0 ? "text-[#111827] font-bold" : "text-[#6B7280]"}`}>{conv.lastMessage}</p>
                          {conv.unanswered > 0 && (
                            <span className="ml-2 flex-shrink-0 min-w-5 h-5 px-1.5 bg-[#F97316] text-white text-[10px] rounded-full flex items-center justify-center font-black">
                              {conv.unanswered}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`flex-1 flex flex-col min-w-0 bg-white ${activeChat ? "flex" : "hidden sm:flex"}`}>
            {activeChat ? (
              <>
                <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-4 flex-shrink-0 bg-[#F9FAFB]">
                  <button onClick={() => setActiveChat(null)} className="sm:hidden p-1 -ml-2 text-[#6B7280] hover:text-[#F97316] transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden bg-[#F97316]">
                    {contactProfiles[activeChat]?.logo_url ? (
                      <img src={contactProfiles[activeChat]!.logo_url!} alt={activeChat} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-sm font-black">{getInitial(contactProfiles[activeChat]?.business_name || activeChat)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#111827] text-sm truncate">{activeChat}</p>
                    {contactProfiles[activeChat]?.business_name && contactProfiles[activeChat]?.business_name !== activeChat ? (
                      <p className="text-[11px] text-[#6B7280] truncate">{contactProfiles[activeChat]?.business_name}</p>
                    ) : (
                      <p className="text-[10px] font-black text-[#16A34A] uppercase tracking-widest">Online</p>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-white">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-8 h-8 border-[2px] border-[#F97316] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <p className="text-[#6B7280] text-sm font-bold uppercase tracking-widest">No messages yet</p>
                    </div>
                  ) : (
                    messages.map(function (msg, i) {
                      const isMe = msg.sender_email === user.email;
                      return (
                        <div key={msg.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] sm:max-w-md ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                            <div className={`px-5 py-3 rounded-2xl text-sm ${isMe ? "bg-[#F97316] text-white rounded-tr-none shadow-sm" : "bg-[#F3F4F6] text-[#111827] rounded-tl-none"}`}>
                              <p className="leading-relaxed">{msg.content}</p>
                            </div>
                            <p className="text-[10px] font-bold text-[#9CA3AF] mt-2 uppercase tracking-tighter">{formatTime(msg.created_at || "")}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="px-6 py-5 border-t border-[#E5E7EB] bg-[#F9FAFB] flex-shrink-0">
                  <div className="flex items-center gap-3">
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
                      className="flex-1 border border-[#E5E7EB] bg-white px-5 py-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FB923C] transition shadow-sm"
                    />

                    <button
                      onClick={handleSend}
                      disabled={sending || !newMessage.trim()}
                      className="w-12 h-12 bg-[#F97316] hover:bg-[#EA580C] disabled:bg-[#FED7AA] rounded-xl flex items-center justify-center transition-all flex-shrink-0 shadow-sm hover:shadow-md"
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-[#F9FAFB]">
                <div className="text-center px-6">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border border-[#E5E7EB] shadow-sm">
                    <svg className="w-10 h-10 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#111827] mb-2 uppercase tracking-widest">Select a Conversation</h3>
                  <p className="text-[#6B7280] text-sm max-w-xs mx-auto">Choose a chat from the sidebar to start communicating with other users.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}