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
      {/* Search */}
      <div className="flex-1 relative" style={{ maxWidth: 440 }}>
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#6B7280" }}
          width="15" height="15" viewBox="0 0 15 15"
          fill="none" stroke="currentColor" strokeWidth="1.5"
        >
          <circle cx="6.5" cy="6.5" r="4.5" />
          <path d="m10 10 3 3" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          placeholder="Search worksheets...  ⌘K"
          className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none transition-colors"
          style={{
            backgroundColor: "#16191F",
            border: "1px solid #252830",
            color: "#E8EAED",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#4D528A")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#252830")}
        />
      </div>

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
