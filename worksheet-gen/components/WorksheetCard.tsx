"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useTransition } from "react";
import { deleteWorksheet } from "@/app/actions/worksheets";

export interface Worksheet {
  id: string;
  courseId: string;
  title: string;
  syllabus: string;
  subject: string;
  modifiedAt: string;
}

interface WorksheetCardProps {
  worksheet: Worksheet;
}

const BASE_SHADOW = '0 1px 3px rgba(71,87,77,0.08), 0 1px 2px rgba(71,87,77,0.04)'
const HOVER_SHADOW = '0 8px 24px rgba(71,87,77,0.14), 0 2px 8px rgba(71,87,77,0.08)'

export function WorksheetCard({ worksheet }: WorksheetCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  return (
    <Link
      href={`/workspace/${worksheet.id}`}
      className="relative group block rounded-xl p-5 transition-all duration-200 ease-in-out"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid rgba(71,87,77,0.08)",
        textDecoration: "none",
        boxShadow: BASE_SHADOW,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = HOVER_SHADOW
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = BASE_SHADOW
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Title row with three-dot menu */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3
          className="text-sm font-semibold leading-snug flex-1"
          style={{ color: "#47574d" }}
        >
          {worksheet.title}
        </h3>

        <div
          ref={menuRef}
          className="relative flex-shrink-0"
          onClick={(e) => e.preventDefault()}
        >
          <button
            aria-label="More options"
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen((v) => !v);
            }}
            className="p-1 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100"
            style={{ color: "#b0bfb4" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f0ede6"; e.currentTarget.style.color = "#6b7b70" }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#b0bfb4" }}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
              <circle cx="7.5" cy="2.5" r="1.2" />
              <circle cx="7.5" cy="7.5" r="1.2" />
              <circle cx="7.5" cy="12.5" r="1.2" />
            </svg>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-32 rounded-lg py-1 z-20"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid rgba(71,87,77,0.1)",
                boxShadow: "0 8px 20px rgba(71,87,77,0.12), 0 2px 6px rgba(71,87,77,0.06)",
              }}
            >
              <button
                disabled={isPending}
                className="w-full text-left px-3 py-2 text-xs font-medium transition-colors disabled:opacity-40"
                style={{ color: "#dc2626" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(220,38,38,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                  startTransition(async () => {
                    await deleteWorksheet(worksheet.id, worksheet.courseId);
                  });
                }}
              >
                {isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
          style={{ backgroundColor: "#f0ede6", color: "#8a9a8f" }}
        >
          {worksheet.syllabus}
        </span>
        <span className="text-xs" style={{ color: "#8a9a8f" }}>
          {worksheet.subject}
        </span>
      </div>

      <p className="text-xs" style={{ color: "#b0bfb4" }}>
        Modified {worksheet.modifiedAt}
      </p>
    </Link>
  );
}
