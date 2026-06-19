"use client";

import Link from "next/link";

interface WorkspaceHeaderProps {
  title: string;
}

export function WorkspaceHeader({ title }: WorkspaceHeaderProps) {
  return (
    <header
      className="workspace-header flex-shrink-0 flex items-center justify-between px-6 h-14"
      style={{
        backgroundColor: "#121417",
        borderBottom: "1px solid #2C2E33",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm flex-shrink-0 transition-colors"
          style={{ color: "#9AA0A6" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 2L4 7l5 5" />
          </svg>
          Back to Library
        </Link>

        <span className="flex-shrink-0 text-sm" style={{ color: "#3A3D44" }}>
          /
        </span>

        <span
          className="text-sm font-medium truncate"
          style={{ color: "#FFFFFF" }}
        >
          {title}
        </span>
      </div>

      <button
        onClick={() => window.print()}
        className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-85"
        style={{ backgroundColor: "#4D528A" }}
      >
        Export Document
      </button>
    </header>
  );
}
