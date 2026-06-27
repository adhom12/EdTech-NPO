"use client";

import { useState, useCallback } from "react";
import { ParametersPanel } from "./ParametersPanel";
import { DocumentCanvas } from "./DocumentCanvas";
import { ChatPanel } from "./ChatPanel";
import { INITIAL_QUESTIONS } from "@/lib/questions";
import type { Question } from "@/lib/questions";
import type { Block } from "@/lib/renderMath";
import type { SkillRow } from "./ParametersPanel";

export const DEFAULT_PARAMETERS: Record<string, string> = {
  syllabus: "Cambridge IGCSE",
  subject: "Physics",
  grade: "Grade 10",
  criterion: "A — Knowing & Understanding",
  difficulty: "Meeting",
};


export function WorkspaceClient({ worksheetTitle }: { worksheetTitle: string }) {
  const [parameters, setParameters] = useState<Record<string, string>>(DEFAULT_PARAMETERS);
  const [selectedSkills, setSelectedSkills] = useState<SkillRow[]>([]);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  const handleApplyParameters = useCallback(async (newParams: Record<string, string>, skills: SkillRow[]) => {
    setParameters(newParams);
    setSelectedSkills(skills);
    setIsGenerating(true);

    const skillPayload = skills.map(s => ({ skill_name: s.skill_name, spec_reference: s.spec_reference }));

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newParams, skills: skillPayload, count: 5 }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Generate error:", err);
        return;
      }

      const data = await res.json();
      setQuestions(data.questions);
    } catch (err) {
      console.error("Generate fetch failed:", err);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleChatSubmit = useCallback(
    async (text: string) => {
      const match = text.match(/question\s+(\d+)/i);
      const qNum = match ? parseInt(match[1]) : null;
      const targetIds = qNum ? [qNum] : questions.map((q) => q.number);
      const targetQuestions = questions.filter((q) => targetIds.includes(q.number));

      setLoadingIds(new Set(targetIds));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: text, questions: targetQuestions, parameters }),
        });

        if (res.ok) {
          const data = await res.json();
          const mutated: Array<{ number: number; marks: number; blocks: Block[] }> = data.questions;
          setQuestions((prev) =>
            prev.map((q) => {
              const updated = mutated.find((m) => m.number === q.number);
              return updated ? { ...q, ...updated } : q;
            })
          );
        }
      } catch (err) {
        console.error("Chat mutation failed:", err);
      } finally {
        setLoadingIds(new Set());
      }
    },
    [questions, parameters]
  );

  return (
    <>
      <ParametersPanel values={parameters} selectedSkills={selectedSkills} onApply={handleApplyParameters} />
      <DocumentCanvas
        worksheetTitle={worksheetTitle}
        parameters={parameters}
        questions={questions}
        loadingIds={loadingIds}
        isGenerating={isGenerating}
      />
      <ChatPanel onSubmit={handleChatSubmit} />
    </>
  );
}
