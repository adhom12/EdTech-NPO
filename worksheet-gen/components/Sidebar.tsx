"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    label: "Home",
    href: "/",
    exact: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6.5L8 2l6 4.5V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6.5z" />
        <path d="M6 15v-5h4v5" />
      </svg>
    ),
  },
  {
    label: "Classes",
    href: "/courses",
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="14" height="11" rx="1.5" />
        <path d="M5 3V2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
        <path d="M1 7h14" />
      </svg>
    ),
  },
  {
    label: "Worksheets",
    href: "/worksheets",
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="1" width="10" height="14" rx="1.5" />
        <path d="M6 5h4M6 8h4M6 11h2" />
      </svg>
    ),
  },
  {
    label: "Reports",
    href: "/reports",
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 13V8m4 5V5m4 8V3" />
        <path d="M1 13.5h14" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col h-screen overflow-y-auto flex-shrink-0"
      style={{
        width: 232,
        backgroundColor: "#0B0D10",
        borderRight: "1px solid #1A1D22",
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid #1A1D22" }}>
        <Link
          href="/"
          className="text-[15px] font-semibold text-white tracking-tight hover:opacity-75 transition-opacity"
        >
          EduHub
        </Link>
      </div>

      {/* Create button */}
      <div className="px-4 pt-4 pb-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
          style={{
            backgroundColor: "#4D528A",
            boxShadow: "0 2px 12px rgba(77,82,138,0.35)",
          }}
        >
          <svg
            width="14" height="14" viewBox="0 0 14 14"
            fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
          >
            <path d="M7 2v10M2 7h10" />
          </svg>
          Create Worksheet
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-1">
        {NAV.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) && item.href !== "/";

          const homeActive = item.exact && pathname === "/";

          const active = isActive || homeActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-all"
              style={{
                color: active ? "#E8EAED" : "#8B929E",
                backgroundColor: active ? "#1A1D24" : "transparent",
                fontWeight: active ? 500 : 400,
              }}
            >
              <span style={{ color: active ? "#7C7FF5" : "#4B5563" }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — admin link */}
      <div className="px-3 pb-4 pt-2" style={{ borderTop: "1px solid #1A1D22" }}>
        <Link
          href="/admin/review"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
          style={{
            color: pathname.startsWith("/admin") ? "#E8EAED" : "#8B929E",
            backgroundColor: pathname.startsWith("/admin") ? "#1A1D24" : "transparent",
          }}
        >
          <span style={{ color: pathname.startsWith("/admin") ? "#7C7FF5" : "#4B5563" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="6" />
              <path d="M8 5v3l2 2" />
            </svg>
          </span>
          Admin Review
        </Link>
      </div>
    </aside>
  );
}
