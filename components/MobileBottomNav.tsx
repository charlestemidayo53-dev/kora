"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const IconHome = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 11.5L12 4l9 7.5M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9" />
  </svg>
);
const IconGrid = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconMessenger = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const IconCart = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const IconUser = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function MobileBottomNav({ user, msgCount }: { user: any; msgCount: number }) {
  const pathname = usePathname();

  // Hide the entire bottom nav on any auth page (login, register, forgot
  // password, etc.) so those pages stay focused on signing in/up with no
  // Home/Categories/Messenger/Cart/My Kora navigation visible.
  if (pathname?.startsWith("/auth")) {
    return null;
  }

  const tabs = [
    { label: "Home", href: "/", Icon: IconHome },
    { label: "Categories", href: "/categories", Icon: IconGrid },
    { label: "Messenger", href: "/message", Icon: IconMessenger, badge: msgCount },
    { label: "Cart", href: "/cart", Icon: IconCart },
    { label: "My Kora", href: user ? "/dashboard" : "/auth/login", Icon: IconUser },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 grid grid-cols-5 h-16 overflow-hidden pb-[env(safe-area-inset-bottom)]">
      {tabs.map(({ label, href, Icon, badge }) => {
        const active = pathname === href;
        return (
          <Link
            key={label}
            href={href}
            className={`relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium leading-none whitespace-nowrap overflow-hidden transition ${
              active ? "text-[#2e8b5a]" : "text-gray-500"
            }`}
          >
            <span className="relative">
              <Icon />
              {!!badge && badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}