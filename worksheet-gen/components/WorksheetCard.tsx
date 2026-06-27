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
      className="relative group block rounded-xl p-5 transition-all duration-150"
      style={{
        backgroundColor: "#1E2024",
        border: "1px solid #2C2E33",
        textDecoration: "none",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "#3A3D44")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "#2C2E33")
      }
    >
      {/* Title row with three-dot menu */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3
          className="text-sm font-semibold leading-snug flex-1"
          style={{ color: "#FFFFFF" }}
        >
          {worksheet.title}
        </h3>

        {/* Three-dot context menu */}
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
            className="p-1 rounded-md transition-all duration-150 opacity-0 group-hover:opacity-100"
            style={{ color: "#9AA0A6" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#2C2E33")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
              <circle cx="7.5" cy="2.5" r="1.2" />
              <circle cx="7.5" cy="7.5" r="1.2" />
              <circle cx="7.5" cy="12.5" r="1.2" />
            </svg>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-32 rounded-lg py-1 z-20 shadow-2xl"
              style={{
                backgroundColor: "#2A2D33",
                border: "1px solid #3A3D44",
              }}
            >
              <button
                disabled={isPending}
                className="w-full text-left px-3 py-2 text-xs font-medium transition-colors disabled:opacity-40"
                style={{ color: "#F87171" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(248,113,113,0.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
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
          style={{ backgroundColor: "#2C2E33", color: "#9AA0A6" }}
        >
          {worksheet.syllabus}
        </span>
        <span className="text-xs" style={{ color: "#9AA0A6" }}>
          {worksheet.subject}
        </span>
      </div>

      <p className="text-xs" style={{ color: "#6B7280" }}>
        Modified {worksheet.modifiedAt}
      </p>
    </Link>
  );
}
