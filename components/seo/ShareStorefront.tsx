"use client";

import { useState } from "react";

type Props = { url: string; name: string };

export default function ShareStorefront({ url, name }: Props) {
  const [copied, setCopied] = useState(false);
  const message = "View " + name + " on Kora Marketplace: " + url;
  const whatsappHref = "https://wa.me/?text=" + encodeURIComponent(message);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(function () { setCopied(false); }, 2000);
    } catch {
      // Clipboard can be unavailable (older browsers, non-secure context).
    }
  }

  return (
    <div className="flex flex-wrap gap-2 mb-5">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 rounded-lg bg-[#F97316] text-white text-sm font-semibold hover:bg-[#c2410c] transition"
      >
        Share on WhatsApp
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-[#F97316] hover:text-[#F97316] transition"
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}