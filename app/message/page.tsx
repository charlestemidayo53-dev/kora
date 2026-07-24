"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getMyConversations, getMessagesBetween, sendMessage } from "@/lib/storage";

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
  unread: number;
};

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(function() {
    async function init() {
      const { data } = await supabase.auth.getUser();

      if (!data?.user) {
        router.push("/auth/login");
        return;
      }

      setUser(data.user);
      await loadConversations(data.user.email || "");
      setLoading(false);
    }

    init();
  }, [router]);

  async function loadConversations(email: string) {
    try {
      const allMessages = await getMyConversations(email);
      if (!Array.isArray(allMessages)) return;

      const convMap: Record<string, Conversation> = {};

      allMessages.forEach(function(msg: Message) {
        const otherEmail = msg.sender_email === email
          ? msg.receiver_email
          : msg.sender_email;

        if (!convMap[otherEmail]) {
          convMap[otherEmail] = {
            email: otherEmail,
            lastMessage: msg.content,
            lastTime: msg.created_at || "",
            unread: !msg.is_read && msg.receiver_email === email ? 1 : 0,
          };
        } else {
          convMap[otherEmail].lastMessage = msg.content;
          convMap[otherEmail].lastTime = msg.created_at || "";

          if (!msg.is_read && msg.receiver_email === email) {
            convMap[otherEmail].unread += 1;
          }
        }
      });

      setConversations(Object.values(convMap));
    } catch (err) {
      console.error("loadConversations error:", err);
    }
  }

  async function openChat(otherEmail: string) {
    if (!user?.email) return;

    setActiveChat(otherEmail);
    setLoadingMessages(true);

    try {
      const msgs = await getMessagesBetween(user.email, otherEmail);
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch (err) {
      console.error("openChat error:", err);
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
      return date.toLocaleTimeString("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
    });
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
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#1a4731]">Messages</h1>
          <p className="text-gray-500 text-sm mt-1">
            Chat directly with buyers and sellers
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: "600px" }}>
          <div className="flex h-full">
            <div className="w-80 border-r border-gray-100 flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-gray-100">
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
                    <div className="w-14 h-14 bg-[#f0faf4] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium text-sm mb-1">
                      No conversations yet
                    </p>
                    <p className="text-gray-400 text-xs">
                      Messages from buyers and sellers will appear here
                    </p>
                  </div>
                ) : (
                  conversations.map(function(conv) {
                    const isActive = activeChat === conv.email;
                    const convClass = isActive
                      ? "flex items-center gap-3 px-4 py-4 cursor-pointer bg-[#f0faf4] border-r-2 border-[#2e8b5a]"
                      : "flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-gray-50 transition border-r-2 border-transparent";

                    return (
                      <div
                        key={conv.email}
                        onClick={function() { openChat(conv.email); }}
                        className={convClass}
                      >
                        <div className="w-10 h-10 bg-[#2e8b5a] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">
                            {getInitial(conv.email)}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {conv.email}
                            </p>
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                              {formatTime(conv.lastTime)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 truncate">
                              {conv.lastMessage}
                            </p>

                            {conv.unread > 0 && (
                              <span className="ml-2 flex-shrink-0 w-5 h-5 bg-[#2e8b5a] text-white text-xs rounded-full flex items-center justify-center font-bold">
                                {conv.unread}
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

            <div className="flex-1 flex flex-col min-w-0">
              {activeChat ? (
                <>
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                    <div className="w-10 h-10 bg-[#2e8b5a] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {getInitial(activeChat)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {activeChat}
                      </p>
                      <p className="text-xs text-[#2e8b5a]">Active now</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <p className="text-gray-500 text-sm font-medium">
                            No messages yet
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Send a message to start the conversation
                          </p>
                        </div>
                      </div>
                    ) : (
                      messages.map(function(msg, i) {
                        const isMe = msg.sender_email === user.email;
                        const bubbleClass = isMe ? "flex justify-end" : "flex justify-start";
                        const msgClass = isMe
                          ? "bg-[#2e8b5a] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs"
                          : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-xs";

                        return (
                          <div key={msg.id || i} className={bubbleClass}>
                            <div>
                              <div className={msgClass}>
                                <p className="text-sm">{msg.content}</p>
                              </div>
                              <p className={"text-xs text-gray-400 mt-1 " + (isMe ? "text-right" : "text-left")}>
                                {formatTime(msg.created_at || "")}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={function(e) { setNewMessage(e.target.value); }}
                        onKeyDown={function(e) {
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
                    <div className="w-20 h-20 bg-[#f0faf4] rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>

                    <h3 className="text-lg font-bold text-gray-700 mb-2">
                      Your Messages
                    </h3>

                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                      Select a conversation from the left to start chatting, or contact a seller from any product page.
                    </p>

                    <a
                      href="/marketplace"
                      className="inline-block mt-6 bg-[#2e8b5a] hover:bg-[#1a4731] text-white px-6 py-3 rounded-xl text-sm font-semibold transition"
                    >
                      Browse Marketplace
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center py-8 text-xs text-gray-400">
        2025 Kora Marketplace · Empowering Nigerian Agriculture
      </div>
    </div>
  );
}