"use client";

export function TopBar() {
  return (
    <header
      className="flex items-center gap-4 px-8 h-14 flex-shrink-0"
      style={{
        backgroundColor: "#121417",
        borderBottom: "1px solid #1A1D22",
      }}
    >
      {/* Right */}
      <div className="ml-auto flex items-center gap-2">
        <button
          aria-label="Help"
          className="p-2 rounded-md transition-colors"
          style={{ color: "#6B7280" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1A1D24")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8.5" cy="8.5" r="7" />
            <path d="M6.25 6.25a2.25 2.25 0 0 1 4.5 0c0 1.5-2.25 2-2.25 3" strokeLinecap="round" />
            <circle cx="8.5" cy="12.5" r="0.75" fill="currentColor" stroke="none" />
          </svg>
        </button>
        <button
          aria-label="User profile"
          className="w-8 h-8 rounded-full text-white text-sm font-semibold flex items-center justify-center select-none transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#4D528A" }}
        >
          T
        </button>
      </div>
    </header>
  );
}
