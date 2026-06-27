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

export interface SkillRow {
  id: string;
  skill_name: string;
  spec_reference: string | null;
  topic: string;
  subtopic: string;
}

interface ParametersPanelProps {
  values: Record<string, string>;
  selectedSkills: SkillRow[];
  onApply: (values: Record<string, string>, skills: SkillRow[]) => void;
}

export function ParametersPanel({ values, selectedSkills, onApply }: ParametersPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>(values);
  const [draftSkills, setDraftSkills] = useState<SkillRow[]>(selectedSkills);
  const [allSkills, setAllSkills] = useState<SkillRow[]>([]);
  const [skillFilter, setSkillFilter] = useState("");
  const skillFetchRef = useRef<AbortController | null>(null);

  const enterEdit = useCallback(() => {
    setDraft(values);
    setDraftSkills(selectedSkills);
    setSkillFilter("");
    setIsEditing(true);
  }, [values, selectedSkills]);

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
    setTimeout(() => {
      setIsEditing(false);
      setDraft(values);
      setDraftSkills(selectedSkills);
    }, 150);
  }, [values, selectedSkills]);

  const applyEdit = useCallback(() => {
    onApply(draft, draftSkills);
    setAnimIn(false);
    setTimeout(() => setIsEditing(false), 150);
  }, [draft, draftSkills, onApply]);

  // Fetch skills whenever panel opens or syllabus/subject changes
  useEffect(() => {
    if (!isEditing) return;
    if (skillFetchRef.current) skillFetchRef.current.abort();
    const controller = new AbortController();
    skillFetchRef.current = controller;

    fetch("/api/skills", { signal: controller.signal })
      .then((r) => r.json())
      .then((data: SkillRow[]) => setAllSkills(data))
      .catch(() => {});

    return () => controller.abort();
  }, [isEditing]);

  const toggleSkill = useCallback((skill: SkillRow) => {
    setDraftSkills((prev) =>
      prev.some((s) => s.id === skill.id)
        ? prev.filter((s) => s.id !== skill.id)
        : [...prev, skill]
    );
  }, []);

  // Group + filter skills for display
  const filteredSkills = skillFilter
    ? allSkills.filter(
        (s) =>
          s.skill_name.toLowerCase().includes(skillFilter.toLowerCase()) ||
          (s.spec_reference ?? "").toLowerCase().includes(skillFilter.toLowerCase()) ||
          s.topic.toLowerCase().includes(skillFilter.toLowerCase())
      )
    : allSkills;

  const skillsByTopic = filteredSkills.reduce<Record<string, SkillRow[]>>((acc, s) => {
    const key = s.subtopic ? `${s.topic} — ${s.subtopic}` : s.topic;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

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
              (e.currentTarget as HTMLElement).style.backgroundColor = "#2C2E33";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#9AA0A6";
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
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
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#FFFFFF"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#9AA0A6"; }}
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
                <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#9AA0A6" }}>
                  {ctrl.label}
                </p>
                <p className="text-sm font-medium leading-snug" style={{ color: "#FFFFFF" }}>
                  {values[ctrl.name]}
                </p>
              </div>
            ))}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#9AA0A6" }}>
                Skills
              </p>
              {selectedSkills.length === 0 ? (
                <p className="text-sm font-medium leading-snug" style={{ color: "#4B5563" }}>
                  None selected
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {selectedSkills.map((s) => (
                    <div key={s.id} className="flex items-start gap-1.5">
                      {s.spec_reference && (
                        <span className="text-xs font-mono flex-shrink-0 mt-0.5" style={{ color: "#4D528A" }}>
                          {s.spec_reference}
                        </span>
                      )}
                      <span className="text-xs leading-snug" style={{ color: "#E5E7EB" }}>
                        {s.skill_name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
                      setDraft((prev) => ({ ...prev, [ctrl.name]: e.target.value }));
                    }}
                    className="w-full pl-3 pr-8 py-2 rounded-lg text-sm appearance-none cursor-pointer focus:outline-none transition-colors"
                    style={{ backgroundColor: "#121417", border: "1px solid #3A3D44", color: "#FFFFFF" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#4D528A")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#3A3D44")}
                  >
                    {ctrl.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#9AA0A6" }}>
                    <ChevronIcon />
                  </span>
                </div>
              </div>
            ))}

            {/* Skill picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9AA0A6" }}>
                Skills{draftSkills.length > 0 ? ` · ${draftSkills.length} selected` : ""}
              </label>

              {/* Search filter */}
              <input
                type="text"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                placeholder="Filter skills…"
                className="w-full px-3 py-1.5 rounded-lg text-xs focus:outline-none"
                style={{ backgroundColor: "#121417", border: "1px solid #3A3D44", color: "#FFFFFF" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#4D528A")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#3A3D44")}
              />

              {/* Grouped skill list */}
              <div
                className="rounded-lg overflow-y-auto"
                style={{ border: "1px solid #3A3D44", maxHeight: "280px" }}
              >
                {allSkills.length === 0 ? (
                  <p className="px-3 py-4 text-xs text-center" style={{ color: "#4B5563" }}>
                    Loading skills…
                  </p>
                ) : Object.keys(skillsByTopic).length === 0 ? (
                  <p className="px-3 py-4 text-xs text-center" style={{ color: "#4B5563" }}>
                    No skills match
                  </p>
                ) : (
                  Object.entries(skillsByTopic).map(([groupLabel, skills]) => (
                    <div key={groupLabel}>
                      <div
                        className="px-3 py-1.5 text-xs font-semibold sticky top-0"
                        style={{ backgroundColor: "#0F1114", color: "#9AA0A6" }}
                      >
                        {groupLabel}
                      </div>
                      {skills.map((skill, idx) => {
                        const isSelected = draftSkills.some((s) => s.id === skill.id);
                        return (
                          <button
                            key={skill.id}
                            onClick={() => toggleSkill(skill)}
                            className="w-full text-left px-3 py-2 flex items-start gap-2 transition-colors"
                            style={{
                              backgroundColor: isSelected ? "rgba(77,82,138,0.25)" : "transparent",
                              borderTop: idx === 0 ? "none" : "1px solid #2C2E33",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.backgroundColor = isSelected ? "rgba(77,82,138,0.25)" : "transparent";
                            }}
                          >
                            <span
                              className="flex-shrink-0 mt-0.5 text-xs"
                              style={{ color: isSelected ? "#4D528A" : "#3A3D44" }}
                            >
                              {isSelected ? "✓" : "○"}
                            </span>
                            <span className="flex-1 text-xs leading-snug" style={{ color: isSelected ? "#FFFFFF" : "#E5E7EB" }}>
                              {skill.skill_name}
                            </span>
                            {skill.spec_reference && (
                              <span className="flex-shrink-0 text-xs font-mono" style={{ color: "#9AA0A6" }}>
                                {skill.spec_reference}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Clear selection */}
              {draftSkills.length > 0 && (
                <button
                  onClick={() => setDraftSkills([])}
                  className="text-xs self-start"
                  style={{ color: "#9AA0A6" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#FFFFFF"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#9AA0A6"; }}
                >
                  Clear selection
                </button>
              )}
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
