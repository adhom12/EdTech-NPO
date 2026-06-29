"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Question } from "@/lib/questions";

interface Control {
  label: string;
  name: string;
  defaultValue: string;
  options: string[];
}

const CONTROLS: Control[] = [
  {
    label: "Syllabus",
    name: "syllabus",
    defaultValue: "Cambridge IGCSE",
    options: ["Cambridge IGCSE", "Edexcel GCSE", "IB MYP", "IB DP", "A-Level"],
  },
  {
    label: "Subject",
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
];

function abbreviateSyllabus(s: string): string {
  const lower = s.toLowerCase();
  if (lower.includes("cambridge assessment international")) return "CIE IGCSE";
  if (lower.includes("cambridge igcse")) return "CIE IGCSE";
  return s;
}

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

function GroupCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="cursor-pointer flex-shrink-0"
      style={{ accentColor: "#e8753b", width: 13, height: 13 }}
    />
  );
}

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
  curriculumId: string | null;
  selectedQuestion?: Question | null;
  onClearSelection?: () => void;
}

export function ParametersPanel({ values, selectedSkills, onApply, curriculumId, selectedQuestion, onClearSelection }: ParametersPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>(values);
  const [draftSkills, setDraftSkills] = useState<SkillRow[]>(selectedSkills);
  const [allSkills, setAllSkills] = useState<SkillRow[]>([]);
  const [skillFilter, setSkillFilter] = useState("");
  const skillFetchRef = useRef<AbortController | null>(null);

  // Exit edit mode whenever a question is selected
  useEffect(() => {
    if (selectedQuestion) {
      setAnimIn(false);
      setTimeout(() => setIsEditing(false), 150);
    }
  }, [selectedQuestion]);

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

  useEffect(() => {
    if (!isEditing) return;
    if (skillFetchRef.current) skillFetchRef.current.abort();
    const controller = new AbortController();
    skillFetchRef.current = controller;

    const url = curriculumId
      ? `/api/skills?curriculum_id=${curriculumId}`
      : "/api/skills";

    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: SkillRow[]) => setAllSkills(data))
      .catch(() => {});

    return () => controller.abort();
  }, [isEditing, curriculumId]);

  const toggleSkill = useCallback((skill: SkillRow) => {
    setDraftSkills((prev) =>
      prev.some((s) => s.id === skill.id)
        ? prev.filter((s) => s.id !== skill.id)
        : [...prev, skill]
    );
  }, []);

  const toggleGroup = useCallback((groupSkills: SkillRow[]) => {
    setDraftSkills((prev) => {
      const allSelected = groupSkills.every((s) => prev.some((d) => d.id === s.id));
      if (allSelected) {
        return prev.filter((d) => !groupSkills.some((s) => s.id === d.id));
      }
      const existingIds = new Set(prev.map((d) => d.id));
      return [...prev, ...groupSkills.filter((s) => !existingIds.has(s.id))];
    });
  }, []);

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
        backgroundColor: "#ffffff",
        borderRight: "1px solid rgba(71,87,77,0.1)",
      }}
    >
      {/* Panel header — switches between params header and question detail header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 py-5"
        style={{ borderBottom: "1px solid #e5e2d9" }}
      >
        {selectedQuestion ? (
          <>
            <button
              onClick={onClearSelection}
              className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: "#8a9a8f" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#47574d"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#8a9a8f"; }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2L4 6l4 4" />
              </svg>
              Parameters
            </button>
            <span className="text-xs font-semibold" style={{ color: "#47574d" }}>
              Q{selectedQuestion.number}
            </span>
          </>
        ) : (
          <>
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#8a9a8f" }}
            >
              Parameters
            </span>

            {!isEditing ? (
              <button
                onClick={enterEdit}
                className="flex items-center gap-1.5 text-xs font-medium transition-colors rounded px-1.5 py-1"
                style={{ color: "#8a9a8f" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#47574d";
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#f0ede6";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#8a9a8f";
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
                style={{ color: "#8a9a8f" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#47574d"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#8a9a8f"; }}
              >
                Cancel
              </button>
            )}
          </>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* QUESTION DETAIL STATE */}
        {selectedQuestion && (
          <div className="px-5 py-7 space-y-6">
            {/* Q number + marks + source badge */}
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span
                  className="text-2xl font-bold"
                  style={{ color: "#47574d", fontFamily: "Georgia, serif" }}
                >
                  Q{selectedQuestion.number}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: "#f0ede6", color: "#6b7b70" }}
                >
                  {selectedQuestion.marks} {selectedQuestion.marks === 1 ? "mark" : "marks"}
                </span>
              </div>
              {selectedQuestion.verified === false && (
                <span
                  className="inline-block text-xs px-2 py-0.5 rounded font-semibold"
                  style={{ backgroundColor: "#EDE9FE", color: "#6D28D9" }}
                >
                  AI Generated
                </span>
              )}
              {selectedQuestion.verified === true && (
                <span
                  className="inline-block text-xs px-2 py-0.5 rounded font-semibold"
                  style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}
                >
                  ✓ Verified
                </span>
              )}
            </div>

            {/* Topic */}
            <div>
              <p
                className="font-semibold uppercase mb-2"
                style={{ fontSize: 10, letterSpacing: "0.13em", color: "#b0bfb4" }}
              >
                Topic
              </p>
              <p className="text-sm font-semibold leading-snug" style={{ color: "#47574d" }}>
                {selectedQuestion.topic ?? "—"}
              </p>
            </div>

            {/* Subtopic */}
            <div>
              <p
                className="font-semibold uppercase mb-2"
                style={{ fontSize: 10, letterSpacing: "0.13em", color: "#b0bfb4" }}
              >
                Subtopic
              </p>
              <p className="text-sm font-semibold leading-snug" style={{ color: "#47574d" }}>
                {selectedQuestion.subtopic ?? "—"}
              </p>
            </div>

            {/* Contextual hint */}
            <p
              className="text-xs leading-relaxed"
              style={{ color: "#b0bfb4" }}
            >
              Use the AI assistant to ask questions or request changes about this question.
            </p>
          </div>
        )}

        {/* PARAMS VIEW STATE */}
        {!selectedQuestion && !isEditing && (
          <div className="px-5 py-7 space-y-6">
            {CONTROLS.map((ctrl) => (
              <div key={ctrl.name}>
                <p
                  className="font-semibold uppercase mb-2"
                  style={{ fontSize: 10, letterSpacing: "0.13em", color: "#b0bfb4" }}
                >
                  {ctrl.label}
                </p>
                <p className="text-sm font-semibold leading-snug" style={{ color: "#47574d" }}>
                  {ctrl.name === "syllabus" ? abbreviateSyllabus(values[ctrl.name]) : values[ctrl.name]}
                </p>
              </div>
            ))}
            <div>
              <p
                className="font-semibold uppercase mb-2"
                style={{ fontSize: 10, letterSpacing: "0.13em", color: "#b0bfb4" }}
              >
                Skills
              </p>
              {selectedSkills.length === 0 ? (
                <p className="text-sm font-medium leading-snug" style={{ color: "#b0bfb4" }}>
                  None selected
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {selectedSkills.map((s) => (
                    <div key={s.id} className="flex items-start gap-1.5">
                      {s.spec_reference && (
                        <span className="text-xs font-mono flex-shrink-0 mt-0.5" style={{ color: "#e8753b" }}>
                          {s.spec_reference}
                        </span>
                      )}
                      <span className="text-xs leading-snug" style={{ color: "#6b7b70" }}>
                        {s.skill_name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PARAMS EDIT STATE */}
        {!selectedQuestion && isEditing && (
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
                  className="font-semibold uppercase"
                  style={{ fontSize: 10, letterSpacing: "0.13em", color: "#b0bfb4" }}
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
                    style={{ backgroundColor: "#faf9f7", border: "1px solid #e5e2d9", color: "#47574d" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#e8753b")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e2d9")}
                  >
                    {ctrl.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#8a9a8f" }}>
                    <ChevronIcon />
                  </span>
                </div>
              </div>
            ))}

            {/* Skill picker */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold uppercase" style={{ fontSize: 10, letterSpacing: "0.13em", color: "#b0bfb4" }}>
                Skills{draftSkills.length > 0 ? ` · ${draftSkills.length} selected` : ""}
              </label>

              <input
                type="text"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                placeholder="Filter skills…"
                className="w-full px-3 py-1.5 rounded-lg text-xs focus:outline-none"
                style={{ backgroundColor: "#faf9f7", border: "1px solid #e5e2d9", color: "#47574d" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#e8753b")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e2d9")}
              />

              <div
                className="rounded-lg overflow-y-auto"
                style={{ border: "1px solid #e5e2d9", maxHeight: "280px" }}
              >
                {allSkills.length === 0 ? (
                  <p className="px-3 py-4 text-xs text-center" style={{ color: "#b0bfb4" }}>
                    Loading skills…
                  </p>
                ) : Object.keys(skillsByTopic).length === 0 ? (
                  <p className="px-3 py-4 text-xs text-center" style={{ color: "#b0bfb4" }}>
                    No skills match
                  </p>
                ) : (
                  Object.entries(skillsByTopic).map(([groupLabel, groupSkills]) => {
                    const selectedInGroup = groupSkills.filter((s) =>
                      draftSkills.some((d) => d.id === s.id)
                    );
                    const allSelected = selectedInGroup.length === groupSkills.length;
                    const someSelected = selectedInGroup.length > 0 && !allSelected;

                    return (
                      <div key={groupLabel}>
                        <div
                          className="px-3 py-1.5 text-xs font-semibold sticky top-0 flex items-center gap-2"
                          style={{ backgroundColor: "#faf9f7", color: "#8a9a8f" }}
                        >
                          <GroupCheckbox
                            checked={allSelected}
                            indeterminate={someSelected}
                            onChange={() => toggleGroup(groupSkills)}
                          />
                          <span className="flex-1 truncate">{groupLabel}</span>
                          {selectedInGroup.length > 0 && (
                            <span style={{ color: "#e8753b" }}>
                              {selectedInGroup.length}/{groupSkills.length}
                            </span>
                          )}
                        </div>
                        {groupSkills.map((skill, idx) => {
                          const isSelected = draftSkills.some((s) => s.id === skill.id);
                          return (
                            <button
                              key={skill.id}
                              onClick={() => toggleSkill(skill)}
                              className="w-full text-left px-3 py-2 flex items-start gap-2 transition-colors"
                              style={{
                                backgroundColor: isSelected ? "rgba(232,117,59,0.07)" : "transparent",
                                borderTop: idx === 0 ? "none" : "1px solid #f0ede6",
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = "#f5f3ef";
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = isSelected ? "rgba(232,117,59,0.07)" : "transparent";
                              }}
                            >
                              <span
                                className="flex-shrink-0 mt-0.5 text-xs"
                                style={{ color: isSelected ? "#e8753b" : "#c0cdc5" }}
                              >
                                {isSelected ? "✓" : "○"}
                              </span>
                              <span className="flex-1 text-xs leading-snug" style={{ color: isSelected ? "#47574d" : "#6b7b70" }}>
                                {skill.skill_name}
                              </span>
                              {skill.spec_reference && (
                                <span className="flex-shrink-0 text-xs font-mono" style={{ color: "#8a9a8f" }}>
                                  {skill.spec_reference}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>

              {draftSkills.length > 0 && (
                <button
                  onClick={() => setDraftSkills([])}
                  className="text-xs self-start"
                  style={{ color: "#8a9a8f" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#47574d"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#8a9a8f"; }}
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer — only in edit mode (not when question selected) */}
      {!selectedQuestion && isEditing && (
        <div
          className="flex-shrink-0 px-4 pb-4 pt-3"
          style={{
            borderTop: "1px solid #e5e2d9",
            transition: "opacity 150ms ease-out",
            opacity: animIn ? 1 : 0,
          }}
        >
          <button
            onClick={applyEdit}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-85"
            style={{ backgroundColor: "#e8753b" }}
          >
            Update Parameters
          </button>
        </div>
      )}
    </aside>
  );
}
