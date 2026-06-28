"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type RecentWorksheet = {
  id: string
  title: string
}

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
];

function DocIcon({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color, flexShrink: 0 }}>
      <rect x="1.5" y="0.5" width="9" height="11" rx="1" stroke="currentColor" strokeWidth="1" />
      <path d="M3.5 3.5h5M3.5 5.5h5M3.5 7.5h3" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" />
    </svg>
  );
}

export function Sidebar({ recentWorksheets = [] }: { recentWorksheets?: RecentWorksheet[] }) {
  const pathname = usePathname();

  function isNavActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    // Worksheets nav also activates on workspace pages
    if (href === "/worksheets") return pathname.startsWith("/worksheets") || pathname.startsWith("/workspace");
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="flex flex-col h-screen flex-shrink-0"
      style={{
        width: 232,
        backgroundColor: "#0B0D10",
        borderRight: "1px solid #1A1D22",
      }}
    >
      {/* ── Logo ── */}
      <div className="px-5 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid #1A1D22" }}>
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #5254A3 0%, #7C7FF5 100%)" }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 9.5h4M2 7h6M2 4.5h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M9 4l2.5 2.5L9 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight">
            <span className="text-white">Edu</span>
            <span style={{ color: "#7C7FF5" }}>Hub</span>
          </span>
        </Link>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* Main nav */}
        <nav className="px-3 pt-3 pb-1">
          {NAV.map((item) => {
            const active = isNavActive(item.href, item.exact ?? false);
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
                <span style={{ color: active ? "#7C7FF5" : "#4B5563" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Recent worksheets section ── */}
        {recentWorksheets.length > 0 && (
          <div className="px-3 pt-3 pb-4">
            {/* Section divider + label */}
            <div className="flex items-center gap-2 px-3 mb-1">
              <span
                className="text-[10px] font-semibold uppercase tracking-widest flex-shrink-0"
                style={{ color: '#3D4450' }}
              >
                Recent
              </span>
              <div className="flex-1" style={{ height: 1, backgroundColor: '#1A1D22' }} />
            </div>

            {/* Worksheet links */}
            {recentWorksheets.map((ws) => {
              const active = pathname === `/workspace/${ws.id}`;
              return (
                <Link
                  key={ws.id}
                  href={`/workspace/${ws.id}`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all group"
                  style={{
                    color: active ? "#C4C8FF" : "#6B7280",
                    backgroundColor: active ? "#1A1D24" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.backgroundColor = "#141720";
                    if (!active) e.currentTarget.style.color = "#9AA0AC";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.backgroundColor = "transparent";
                    if (!active) e.currentTarget.style.color = "#6B7280";
                  }}
                >
                  <DocIcon color={active ? "#7C7FF5" : "#3D4450"} />
                  <span className="truncate leading-snug">{ws.title}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Admin — pinned bottom ── */}
      <div className="px-3 pb-4 pt-3 flex-shrink-0" style={{ borderTop: "1px solid #1A1D22" }}>
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
