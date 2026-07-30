"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getMyConversations, getMessagesBetween, markMessagesAsRead, sendMessage } from "@/lib/storage";

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

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f0faf4]">
          <div className="w-12 h-12 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin" />
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
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

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

      setConversations(Object.values(convMap));
    } catch (err) {
      console.error("loadConversations error:", err);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0faf4]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0faf4]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6 px-1">
          <h1 className="text-xl sm:text-2xl font-black text-[#1a4731]">Messages</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Chat directly with buyers and sellers</p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[75vh] sm:h-[600px]">
          <div className="flex h-full">
            <div className={`w-full sm:w-80 border-r border-gray-100 flex-col flex-shrink-0 ${activeChat ? "hidden sm:flex" : "flex"}`}>
              <div className="p-3 sm:p-4 border-b border-gray-100">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2e8b5a] transition"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    <p className="text-gray-600 font-medium text-sm mb-1">No conversations yet</p>
                    <p className="text-gray-400 text-xs">Messages from buyers and sellers will appear here</p>
                  </div>
                ) : (
                  conversations.map(function (conv) {
                    const isActive = activeChat === conv.email;
                    const convClass = isActive
                      ? "flex items-center gap-3 px-4 py-4 cursor-pointer bg-[#f0faf4] border-r-2 border-[#2e8b5a]"
                      : "flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-gray-50 transition border-r-2 border-transparent";

                    return (
                      <div key={conv.email} onClick={function () { openChat(conv.email); }} className={convClass}>
                        <div className="w-10 h-10 bg-[#2e8b5a] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">{getInitial(conv.email)}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="text-sm font-semibold text-gray-800 truncate">{conv.email}</p>
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatTime(conv.lastTime)}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>

                            {conv.unanswered > 0 && (
                              <span className="ml-2 flex-shrink-0 min-w-5 h-5 px-1 bg-[#2e8b5a] text-white text-xs rounded-full flex items-center justify-center font-bold">
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

            <div className={`flex-1 flex-col min-w-0 ${activeChat ? "flex" : "hidden sm:flex"}`}>
              {activeChat ? (
                <>
                  <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                    <button onClick={() => setActiveChat(null)} className="sm:hidden p-1 -ml-1 text-gray-500 hover:text-[#2e8b5a] transition">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="w-10 h-10 bg-[#2e8b5a] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">{getInitial(activeChat)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{activeChat}</p>
                      <p className="text-xs text-[#2e8b5a]">Active now</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-3">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-center">
                        <p className="text-gray-500 text-sm font-medium">No messages yet</p>
                      </div>
                    ) : (
                      messages.map(function (msg, i) {
                        const isMe = msg.sender_email === user.email;
                        const bubbleClass = isMe ? "flex justify-end" : "flex justify-start";
                        const msgClass = isMe
                          ? "bg-[#2e8b5a] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%] sm:max-w-xs"
                          : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%] sm:max-w-xs";

                        return (
                          <div key={msg.id || i} className={bubbleClass}>
                            <div>
                              <div className={msgClass}>
                                <p className="text-sm">{msg.content}</p>
                              </div>
                              <p className={"text-xs text-gray-400 mt-1 " + (isMe ? "text-right" : "text-left")}>{formatTime(msg.created_at || "")}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={function (e) { setNewMessage(e.target.value); }}
                        onKeyDown={function (e) {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        className="flex-1 border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2e8b5a] transition"
                      />

                      <button
                        onClick={handleSend}
                        disabled={sending || !newMessage.trim()}
                        className="w-11 h-11 bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-200 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition flex-shrink-0"
                      >
                        {sending ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center px-8">
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Your Messages</h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                      Select a conversation from the left to start chatting, or contact a seller from any product page.
                    </p>
                    <a href="/marketplace" className="inline-block mt-6 bg-[#2e8b5a] hover:bg-[#1a4731] text-white px-6 py-3 rounded-xl text-sm font-semibold transition">
                      Browse Marketplace
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center py-6 sm:py-8 text-xs text-gray-400">
        2025 Kora Marketplace - Empowering Nigerian Agriculture
      </div>
    </div>
  );
}
