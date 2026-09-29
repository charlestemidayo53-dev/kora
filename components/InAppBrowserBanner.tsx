"use client";

import { useEffect, useState } from "react";

function detectInAppBrowser(userAgent: string): string | null {
  const ua = userAgent.toLowerCase();

  if (ua.includes("fban") || ua.includes("fbav") || ua.includes("fb_iab")) {
    return "Facebook";
  }
  if (ua.includes("messenger")) {
    return "Messenger";
  }
  if (ua.includes("twitter")) {
    return "X (Twitter)";
  }
  if (ua.includes("instagram")) {
    return "Instagram";
  }
  if (ua.includes("line/")) {
    return "LINE";
  }

  return null;
}

export default function InAppBrowserBanner() {
  const [appName, setAppName] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(function () {
    const detected = detectInAppBrowser(navigator.userAgent);
    setAppName(detected);
  }, []);

  if (!appName || dismissed) return null;

  function handleOpenInBrowser() {
    const currentUrl = window.location.href;

    const isAndroid = /android/i.test(navigator.userAgent);

    if (isAndroid) {
      const intentUrl =
        "intent://" +
        currentUrl.replace(/^https?:\/\//, "") +
        "#Intent;scheme=https;package=com.android.chrome;end";
      window.location.href = intentUrl;
    } else {
      navigator.clipboard?.writeText(currentUrl).catch(function () {});
      alert(
        "Link copied! Tap the ... menu above and choose \"Open in Safari\" or \"Open in Browser\" to view Kora properly."
      );
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] bg-[#111827] text-white rounded-xl shadow-lg p-4 flex items-center justify-between gap-3">
      <p className="text-sm leading-snug">
        You're viewing Kora inside {appName}. For the best experience, open this
        page in your browser.
      </p>
      <div className="flex flex-col gap-2 flex-shrink-0">
        <button
          onClick={handleOpenInBrowser}
          className="bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap transition"
        >
          Open in Browser
        </button>
        <button
          onClick={function () {
            setDismissed(true);
          }}
          className="text-white/60 text-xs hover:text-white transition"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
