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
    if (href === "/worksheets") return pathname.startsWith("/worksheets") || pathname.startsWith("/workspace");
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="flex flex-col h-screen flex-shrink-0"
      style={{
        width: 232,
        backgroundColor: "#ffffff",
        borderRight: "1px solid rgba(71,87,77,0.1)",
        boxShadow: "2px 0 12px rgba(71,87,77,0.06)",
      }}
    >
      {/* ── Logo ── */}
      <div className="px-5 pt-5 pb-4 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #d4622a 0%, #e8753b 100%)" }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 9.5h4M2 7h6M2 4.5h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M9 4l2.5 2.5L9 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight">
            <span style={{ color: "#47574d" }}>Edu</span>
            <span style={{ color: "#e8753b" }}>Hub</span>
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
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-all duration-200 ease-in-out"
                style={{
                  color: active ? "#2c4a3e" : "#8a9a8f",
                  backgroundColor: active ? "#ccdae5" : "transparent",
                  fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = "#f0ede6" }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = "transparent" }}
              >
                <span style={{ color: active ? "#47574d" : "#b0bfb4" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Recent worksheets section ── */}
        {recentWorksheets.length > 0 && (
          <div className="px-3 pt-3 pb-4">
            <div className="flex items-center gap-2 px-3 mb-1">
              <span
                className="text-[10px] font-semibold uppercase tracking-widest flex-shrink-0"
                style={{ color: '#c0cdc5' }}
              >
                Recent
              </span>
              <div className="flex-1" style={{ height: 1, backgroundColor: '#e5e2d9' }} />
            </div>

            {recentWorksheets.map((ws) => {
              const active = pathname === `/workspace/${ws.id}`;
              return (
                <Link
                  key={ws.id}
                  href={`/workspace/${ws.id}`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-200 ease-in-out group"
                  style={{
                    color: active ? "#e8753b" : "#8a9a8f",
                    backgroundColor: active ? "#fdf0e9" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) { e.currentTarget.style.backgroundColor = "#f5f3ef"; e.currentTarget.style.color = "#6b7b70" }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#8a9a8f" }
                  }}
                >
                  <DocIcon color={active ? "#e8753b" : "#c0cdc5"} />
                  <span className="truncate leading-snug">{ws.title}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Admin — pinned bottom ── */}
      <div className="px-3 pb-4 pt-3 flex-shrink-0" style={{ borderTop: "1px solid #e5e2d9" }}>
        <Link
          href="/admin/review"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ease-in-out"
          style={{
            color: pathname.startsWith("/admin") ? "#2c4a3e" : "#8a9a8f",
            backgroundColor: pathname.startsWith("/admin") ? "#ccdae5" : "transparent",
          }}
          onMouseEnter={(e) => { if (!pathname.startsWith("/admin")) e.currentTarget.style.backgroundColor = "#f0ede6" }}
          onMouseLeave={(e) => { if (!pathname.startsWith("/admin")) e.currentTarget.style.backgroundColor = "transparent" }}
        >
          <span style={{ color: pathname.startsWith("/admin") ? "#47574d" : "#b0bfb4" }}>
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
