"use client";

import { useState, useEffect, useRef } from "react";
import type { SkillRow } from "./ParametersPanel";

interface WorkspaceSetupProps {
  worksheetTitle: string;
  subject: string;
  syllabus: string;
  grade: string;
  curriculumId: string | null;
  onGenerate: (opts: { topic: string; skills: SkillRow[]; questionCount: number }) => void;
}

function abbreviateSyllabus(s: string): string {
  const l = s.toLowerCase();
  if (l.includes("cambridge assessment international") || l.includes("cambridge igcse")) return "CIE IGCSE";
  return s;
}

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#b0bfb4",
};

export function WorkspaceSetup({
  worksheetTitle,
  subject,
  syllabus,
  grade,
  curriculumId,
  onGenerate,
}: WorkspaceSetupProps) {
  const [topic, setTopic] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<SkillRow[]>([]);
  const [allSkills, setAllSkills] = useState<SkillRow[]>([]);
  const [skillFilter, setSkillFilter] = useState("");
  const [skillPickerCollapsed, setSkillPickerCollapsed] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const topicRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    topicRef.current?.focus();
    const url = curriculumId
      ? `/api/skills?curriculum_id=${curriculumId}`
      : "/api/skills";
    fetch(url)
      .then((r) => r.json())
      .then((data: SkillRow[]) => setAllSkills(data))
      .catch(() => {});
  }, [curriculumId]);

  const filteredSkills = skillFilter
    ? allSkills.filter(
        (s) =>
          s.skill_name.toLowerCase().includes(skillFilter.toLowerCase()) ||
          s.topic.toLowerCase().includes(skillFilter.toLowerCase()) ||
          (s.spec_reference ?? "").toLowerCase().includes(skillFilter.toLowerCase())
      )
    : allSkills;

  const skillsByGroup = filteredSkills.reduce<Record<string, SkillRow[]>>((acc, s) => {
    const key = s.subtopic ? `${s.topic} — ${s.subtopic}` : s.topic;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  function toggleSkill(skill: SkillRow) {
    setSelectedSkills((prev) =>
      prev.some((s) => s.id === skill.id)
        ? prev.filter((s) => s.id !== skill.id)
        : [...prev, skill]
    );
  }

  function toggleGroup(groupSkills: SkillRow[]) {
    setSelectedSkills((prev) => {
      const allSelected = groupSkills.every((gs) => prev.some((s) => s.id === gs.id));
      if (allSelected) {
        return prev.filter((s) => !groupSkills.some((gs) => gs.id === s.id));
      }
      const existingIds = new Set(prev.map((s) => s.id));
      return [...prev, ...groupSkills.filter((gs) => !existingIds.has(gs.id))];
    });
  }

  function removeSkill(id: string) {
    setSelectedSkills((prev) => prev.filter((s) => s.id !== id));
  }

  function handleSubmit() {
    onGenerate({ topic: topic.trim(), skills: selectedSkills, questionCount });
  }

  return (
    <div
      className="flex-1 overflow-y-auto hide-scrollbar flex items-start justify-center"
      style={{ backgroundColor: "#e7e5de" }}
    >
      <div className="w-full max-w-[560px] mx-auto py-12 px-4">
        {/* Context overline */}
        <p className="text-center mb-1.5" style={{ ...LABEL_STYLE, fontSize: 11 }}>
          {abbreviateSyllabus(syllabus)} · {subject} · {grade}
        </p>
        <h2
          className="text-[22px] font-bold text-center mb-7 leading-snug"
          style={{ color: "#47574d", fontFamily: "Georgia, serif" }}
        >
          Set up your question set
        </h2>

        {/* Card */}
        <div
          className="rounded-2xl"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 32px rgba(71,87,77,0.12), 0 1px 8px rgba(71,87,77,0.07)",
          }}
        >
          <div className="px-8 pt-8 pb-6 space-y-7">
            {/* Topic focus */}
            <div>
              <p style={LABEL_STYLE} className="mb-2">Topic focus</p>
              <input
                ref={topicRef}
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="e.g. Algebra, Circle Theorems, Probability"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm focus:outline-none transition-colors"
                style={{ backgroundColor: "#faf9f7", border: "1px solid #e5e2d9", color: "#47574d" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#e8753b")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e2d9")}
              />
              <p className="mt-1.5 text-xs" style={{ color: "#b0bfb4" }}>
                Optional — leave blank to generate across the full syllabus.
              </p>
            </div>

            {/* Skills */}
            <div>
              {/* Section header */}
              <div className="flex items-center justify-between mb-2">
                <p style={LABEL_STYLE}>
                  Skills{selectedSkills.length > 0 ? ` · ${selectedSkills.length} selected` : ""}
                </p>
                <div className="flex items-center gap-3">
                  {selectedSkills.length > 0 && (
                    <button
                      onClick={() => setSelectedSkills([])}
                      className="text-xs transition-colors"
                      style={{ color: "#b0bfb4" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#e8753b"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#b0bfb4"; }}
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setSkillPickerCollapsed((c) => !c)}
                    className="flex items-center gap-1 text-xs transition-colors"
                    style={{ color: "#8a9a8f" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#47574d"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#8a9a8f"; }}
                  >
                    {skillPickerCollapsed ? "Show checklist" : "Hide checklist"}
                    <svg
                      width="10" height="10" viewBox="0 0 10 10" fill="none"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                      style={{ transform: skillPickerCollapsed ? "rotate(180deg)" : "none", transition: "transform 150ms" }}
                    >
                      <path d="M2 6.5l3-3 3 3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Selected skills tags — always visible when items selected */}
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1"
                      style={{
                        backgroundColor: "rgba(71,87,77,0.07)",
                        border: "1px solid rgba(71,87,77,0.15)",
                        color: "#47574d",
                      }}
                    >
                      {skill.spec_reference && (
                        <span className="font-mono" style={{ color: "#e8753b" }}>{skill.spec_reference}</span>
                      )}
                      <span>{skill.skill_name}</span>
                      <button
                        onClick={() => removeSkill(skill.id)}
                        className="flex-shrink-0 transition-colors"
                        style={{ color: "#b0bfb4", lineHeight: 1 }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#e8753b"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#b0bfb4"; }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Collapsible checklist */}
              {!skillPickerCollapsed && (
                <>
                  <input
                    type="text"
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    placeholder="Filter skills…"
                    className="w-full px-3 py-1.5 rounded-lg text-xs mb-2 focus:outline-none"
                    style={{ backgroundColor: "#faf9f7", border: "1px solid #e5e2d9", color: "#47574d" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#e8753b")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e2d9")}
                  />

                  <div
                    className="rounded-xl overflow-y-auto"
                    style={{ border: "1px solid #e5e2d9", maxHeight: 240 }}
                  >
                    {allSkills.length === 0 ? (
                      <p className="px-4 py-5 text-xs text-center" style={{ color: "#b0bfb4" }}>
                        Loading skills…
                      </p>
                    ) : Object.keys(skillsByGroup).length === 0 ? (
                      <p className="px-4 py-5 text-xs text-center" style={{ color: "#b0bfb4" }}>
                        No skills match.
                      </p>
                    ) : (
                      Object.entries(skillsByGroup).map(([group, groupSkills]) => {
                        const selectedInGroup = groupSkills.filter((gs) =>
                          selectedSkills.some((s) => s.id === gs.id)
                        );
                        const allGroupSelected = selectedInGroup.length === groupSkills.length;
                        const someGroupSelected = selectedInGroup.length > 0 && !allGroupSelected;

                        return (
                          <div key={group}>
                            {/* Group header with select-all toggle */}
                            <button
                              onClick={() => toggleGroup(groupSkills)}
                              className="w-full px-3 py-2 flex items-center gap-2 sticky top-0 transition-colors text-left"
                              style={{ backgroundColor: "#faf9f7" }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#f0ede6"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#faf9f7"; }}
                            >
                              <span
                                className="flex-shrink-0 text-xs font-bold"
                                style={{
                                  color: allGroupSelected ? "#e8753b" : someGroupSelected ? "#e8753b" : "#c0cdc5",
                                }}
                              >
                                {allGroupSelected ? "✓" : someGroupSelected ? "−" : "○"}
                              </span>
                              <span className="flex-1 text-xs font-semibold" style={{ color: "#8a9a8f" }}>
                                {group}
                              </span>
                              {selectedInGroup.length > 0 && (
                                <span className="text-xs font-mono flex-shrink-0" style={{ color: "#e8753b" }}>
                                  {selectedInGroup.length}/{groupSkills.length}
                                </span>
                              )}
                            </button>

                            {/* Individual skills */}
                            {groupSkills.map((skill, idx) => {
                              const isChosen = selectedSkills.some((s) => s.id === skill.id);
                              return (
                                <button
                                  key={skill.id}
                                  onClick={() => toggleSkill(skill)}
                                  className="w-full text-left px-3 py-2 flex items-start gap-2 transition-colors"
                                  style={{
                                    backgroundColor: isChosen ? "rgba(232,117,59,0.06)" : "transparent",
                                    borderTop: idx === 0 ? "none" : "1px solid #f0ede6",
                                    paddingLeft: 28,
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isChosen) (e.currentTarget as HTMLElement).style.backgroundColor = "#f5f3ef";
                                  }}
                                  onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.backgroundColor = isChosen
                                      ? "rgba(232,117,59,0.06)"
                                      : "transparent";
                                  }}
                                >
                                  <span className="flex-shrink-0 mt-0.5 text-xs" style={{ color: isChosen ? "#e8753b" : "#c0cdc5" }}>
                                    {isChosen ? "✓" : "○"}
                                  </span>
                                  <span className="flex-1 text-xs leading-snug" style={{ color: isChosen ? "#47574d" : "#6b7b70" }}>
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
                </>
              )}

              <p className="mt-1.5 text-xs" style={{ color: "#b0bfb4" }}>
                Optional — pin questions to specific syllabus objectives.
              </p>
            </div>

            {/* Question count */}
            <div>
              <p style={LABEL_STYLE} className="mb-3">Number of questions</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuestionCount((c) => Math.max(3, c - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-medium transition-all"
                  style={{ backgroundColor: "#f0ede6", color: "#6b7b70", border: "1px solid #e5e2d9" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#e8753b";
                    (e.currentTarget as HTMLElement).style.color = "#ffffff";
                    (e.currentTarget as HTMLElement).style.borderColor = "#e8753b";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#f0ede6";
                    (e.currentTarget as HTMLElement).style.color = "#6b7b70";
                    (e.currentTarget as HTMLElement).style.borderColor = "#e5e2d9";
                  }}
                >
                  −
                </button>
                <span className="text-2xl font-bold w-8 text-center tabular-nums" style={{ color: "#47574d" }}>
                  {questionCount}
                </span>
                <button
                  onClick={() => setQuestionCount((c) => Math.min(10, c + 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-medium transition-all"
                  style={{ backgroundColor: "#f0ede6", color: "#6b7b70", border: "1px solid #e5e2d9" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#e8753b";
                    (e.currentTarget as HTMLElement).style.color = "#ffffff";
                    (e.currentTarget as HTMLElement).style.borderColor = "#e8753b";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#f0ede6";
                    (e.currentTarget as HTMLElement).style.color = "#6b7b70";
                    (e.currentTarget as HTMLElement).style.borderColor = "#e5e2d9";
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-8 py-5 flex items-center justify-between"
            style={{ borderTop: "1px solid #f0ede6" }}
          >
            <p className="text-xs truncate pr-4" style={{ color: "#b0bfb4", maxWidth: "60%" }}>
              {worksheetTitle}
            </p>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85 flex-shrink-0"
              style={{ backgroundColor: "#e8753b" }}
            >
              Generate
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 7h10M8 3l4 4-4 4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
