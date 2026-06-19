"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Control {
  label: string;
  name: string;
  defaultValue: string;
  options: string[];
}

const CONTROLS: Control[] = [
  {
    label: "Active Syllabus",
    name: "syllabus",
    defaultValue: "Cambridge IGCSE",
    options: ["Cambridge IGCSE", "Edexcel GCSE", "IB MYP", "IB DP", "A-Level"],
  },
  {
    label: "Core Subject",
    name: "subject",
    defaultValue: "Physics",
    options: [
      "Physics",
      "Biology",
      "Chemistry",
      "Mathematics",
      "History",
      "Economics",
    ],
  },
  {
    label: "Grade Level",
    name: "grade",
    defaultValue: "Grade 10",
    options: [
      "Grade 7",
      "Grade 8",
      "Grade 9",
      "Grade 10",
      "Grade 11",
      "Grade 12",
    ],
  },
  {
    label: "Criterion",
    name: "criterion",
    defaultValue: "A — Knowing & Understanding",
    options: [
      "A — Knowing & Understanding",
      "B — Investigating Patterns",
      "C — Communicating",
      "D — Applying Mathematics",
    ],
  },
  {
    label: "Target Difficulty",
    name: "difficulty",
    defaultValue: "Meeting",
    options: ["Approaching", "Meeting", "Exceeding"],
  },
];

const PencilIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 13 13"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.5 1.5 11.5 3.5 4 11 1.5 11.5 2 9Z" />
  </svg>
);

const ChevronIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 4l4 4 4-4" />
  </svg>
);

interface TopicSuggestion {
  id: string;
  name: string;
}

interface ParametersPanelProps {
  values: Record<string, string>;
  onApply: (values: Record<string, string>) => void;
}

export function ParametersPanel({ values, onApply }: ParametersPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>(values);
  const [suggestions, setSuggestions] = useState<TopicSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enterEdit = useCallback(() => {
    setDraft(values);
    setIsEditing(true);
    setSuggestions([]);
  }, [values]);

  useEffect(() => {
    if (isEditing) {
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnimIn(true))
      );
      return () => cancelAnimationFrame(raf);
    } else {
      setAnimIn(false);
    }
  }, [isEditing]);

  const cancelEdit = useCallback(() => {
    setAnimIn(false);
    setSuggestions([]);
    setTimeout(() => {
      setIsEditing(false);
      setDraft(values);
    }, 150);
  }, [values]);

  const applyEdit = useCallback(() => {
    onApply(draft);
    setAnimIn(false);
    setSuggestions([]);
    setTimeout(() => setIsEditing(false), 150);
  }, [draft, onApply]);

  const fetchSuggestions = useCallback(async (q: string, syllabus: string, subject: string) => {
    if (!syllabus || !subject) return;
    try {
      const params = new URLSearchParams({ syllabus, subject, q });
      const res = await fetch(`/api/topics?${params}`);
      if (res.ok) {
        const data: TopicSuggestion[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    } catch {}
  }, []);

  const handleTopicChange = useCallback(
    (value: string) => {
      setDraft((prev) => ({ ...prev, topic: value }));
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (value.length === 0) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(value, draft.syllabus, draft.subject);
      }, 300);
    },
    [draft.syllabus, draft.subject, fetchSuggestions]
  );

  const selectSuggestion = useCallback((name: string) => {
    setDraft((prev) => ({ ...prev, topic: name }));
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  return (
    <aside
      className="params-panel flex flex-col flex-shrink-0 overflow-hidden"
      style={{
        width: "20%",
        backgroundColor: "#1E2024",
        borderRight: "1px solid #2C2E33",
      }}
    >
      {/* Panel header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 py-5"
        style={{ borderBottom: "1px solid #2C2E33" }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "#9AA0A6" }}
        >
          Parameters
        </span>

        {!isEditing ? (
          <button
            onClick={enterEdit}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors rounded px-1.5 py-1"
            style={{ color: "#9AA0A6" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "#2C2E33";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#9AA0A6";
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "transparent";
            }}
          >
            <PencilIcon />
            Edit
          </button>
        ) : (
          <button
            onClick={cancelEdit}
            className="text-xs font-medium transition-colors rounded px-1.5 py-1"
            style={{ color: "#9AA0A6" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#9AA0A6";
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* VIEW STATE */}
        {!isEditing && (
          <div className="px-5 py-6 space-y-6">
            {CONTROLS.map((ctrl) => (
              <div key={ctrl.name}>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: "#9AA0A6" }}
                >
                  {ctrl.label}
                </p>
                <p
                  className="text-sm font-medium leading-snug"
                  style={{ color: "#FFFFFF" }}
                >
                  {values[ctrl.name]}
                </p>
              </div>
            ))}
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: "#9AA0A6" }}
              >
                Topic
              </p>
              <p
                className="text-sm font-medium leading-snug"
                style={{ color: values.topic ? "#FFFFFF" : "#4B5563" }}
              >
                {values.topic || "All Topics"}
              </p>
            </div>
          </div>
        )}

        {/* EDIT STATE */}
        {isEditing && (
          <div
            className="px-5 py-6 space-y-5"
            style={{
              transition: "opacity 150ms ease-out, transform 150ms ease-out",
              opacity: animIn ? 1 : 0,
              transform: animIn ? "translateY(0)" : "translateY(-8px)",
            }}
          >
            {CONTROLS.map((ctrl) => (
              <div key={ctrl.name} className="flex flex-col gap-1.5">
                <label
                  htmlFor={`edit-${ctrl.name}`}
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#9AA0A6" }}
                >
                  {ctrl.label}
                </label>

                <div className="relative">
                  <select
                    id={`edit-${ctrl.name}`}
                    value={draft[ctrl.name]}
                    onChange={(e) => {
                      setDraft((prev) => ({
                        ...prev,
                        [ctrl.name]: e.target.value,
                      }));
                      // Clear topic suggestions when syllabus/subject changes
                      if (ctrl.name === "syllabus" || ctrl.name === "subject") {
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }
                    }}
                    className="w-full pl-3 pr-8 py-2 rounded-lg text-sm appearance-none cursor-pointer focus:outline-none transition-colors"
                    style={{
                      backgroundColor: "#121417",
                      border: "1px solid #3A3D44",
                      color: "#FFFFFF",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#4D528A")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "#3A3D44")
                    }
                  >
                    {ctrl.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <span
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "#9AA0A6" }}
                  >
                    <ChevronIcon />
                  </span>
                </div>
              </div>
            ))}

            {/* Topic field with typeahead */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-topic"
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#9AA0A6" }}
              >
                Topic
              </label>
              <div className="relative">
                <input
                  id="edit-topic"
                  type="text"
                  value={draft.topic ?? ""}
                  onChange={(e) => handleTopicChange(e.target.value)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#4D528A";
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  placeholder="e.g. Forces and Motion"
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors"
                  style={{
                    backgroundColor: "#121417",
                    border: "1px solid #3A3D44",
                    color: "#FFFFFF",
                  }}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    className="absolute left-0 right-0 top-full mt-1 rounded-lg overflow-hidden z-10"
                    style={{
                      backgroundColor: "#1E2024",
                      border: "1px solid #3A3D44",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                    }}
                  >
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        onMouseDown={() => selectSuggestion(s.name)}
                        className="w-full text-left px-3 py-2 text-sm transition-colors"
                        style={{ color: "#E5E7EB" }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLElement).style.backgroundColor = "#2C2E33")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")
                        }
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer — only in edit mode */}
      {isEditing && (
        <div
          className="flex-shrink-0 px-4 pb-4 pt-3"
          style={{
            borderTop: "1px solid #2C2E33",
            transition: "opacity 150ms ease-out",
            opacity: animIn ? 1 : 0,
          }}
        >
          <button
            onClick={applyEdit}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-85"
            style={{ backgroundColor: "#4D528A" }}
          >
            Update Parameters
          </button>
        </div>
      )}
    </aside>
  );
}
