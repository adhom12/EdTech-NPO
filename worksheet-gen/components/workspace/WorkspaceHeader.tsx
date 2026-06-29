"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { renameWorksheet } from "@/app/actions/worksheets";

interface WorkspaceHeaderProps {
  title: string;
  worksheetId: string;
  backHref?: string;
}

export function WorkspaceHeader({ title, worksheetId, backHref = "/" }: WorkspaceHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.select();
    }
  }, [editing]);

  async function commit() {
    setEditing(false);
    const trimmed = value.trim();
    if (!trimmed) { setValue(title); return; }
    if (trimmed === title) return;
    await renameWorksheet(worksheetId, trimmed);
  }

  return (
    <header
      className="workspace-header flex-shrink-0 flex items-center justify-between px-6 h-14"
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid rgba(71,87,77,0.1)",
        boxShadow: "0 1px 3px rgba(71,87,77,0.06)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href={backHref}
          className="flex items-center gap-1.5 text-sm flex-shrink-0 transition-colors hover:opacity-70"
          style={{ color: "#8a9a8f" }}
        >
          <svg
            width="14" height="14" viewBox="0 0 14 14"
            fill="none" stroke="currentColor" strokeWidth="1.75"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M9 2L4 7l5 5" />
          </svg>
          {backHref === "/" ? "Back to Library" : "Back to Course"}
        </Link>

        <span className="flex-shrink-0 text-sm" style={{ color: "#e5e2d9" }}>/</span>

        {editing ? (
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.currentTarget.blur(); }
              if (e.key === "Escape") { setValue(title); setEditing(false); }
            }}
            className="text-sm font-medium bg-transparent outline-none min-w-0"
            style={{
              color: "#47574d",
              borderBottom: "1px solid #e8753b",
              maxWidth: 320,
              width: `${Math.max(value.length, 8)}ch`,
            }}
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            title="Click to rename"
            className="text-sm font-medium truncate text-left transition-colors group flex items-center gap-1.5"
            style={{ color: "#47574d", maxWidth: 320 }}
          >
            <span className="truncate">{value}</span>
            <svg
              width="11" height="11" viewBox="0 0 14 14"
              fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "#8a9a8f" }}
            >
              <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" />
            </svg>
          </button>
        )}
      </div>

      <button
        onClick={() => window.print()}
        className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-85"
        style={{ backgroundColor: "#e8753b" }}
      >
        Export Document
      </button>
    </header>
  );
}
