"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PendingQuestion {
  id: string;
  syllabus: string;
  subject: string;
  grade: number;
  criterion: string;
  difficulty: string;
  question_type: string;
  question_text: string;
  mark_scheme: string;
  source: string | null;
  topic_name: string | null;
}

function questionPreview(questionText: string): string {
  try {
    const blocks = JSON.parse(questionText);
    const first = blocks.find((b: { type: string }) => b.type === "p");
    const text = first?.text ?? "";
    return text.replace(/\$[^$]+\$/g, "…").slice(0, 120) + (text.length > 120 ? "…" : "");
  } catch {
    return questionText.slice(0, 120);
  }
}

function markSchemeText(markScheme: string): string {
  try {
    const ms = JSON.parse(markScheme);
    return `[${ms.marks ?? "?"}m] ${ms.text ?? ""}`;
  } catch {
    return markScheme.slice(0, 100);
  }
}

export function ReviewTable({ questions }: { questions: PendingQuestion[] }) {
  const router = useRouter();
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [done, setDone] = useState<Set<string>>(new Set());

  async function handleAction(id: string, action: "approve" | "reject") {
    setProcessing((p) => new Set(p).add(id));
    const res = await fetch(`/api/questions/${id}`, {
      method: action === "approve" ? "PATCH" : "DELETE",
    });
    if (res.ok) setDone((d) => new Set(d).add(id));
    setProcessing((p) => { const next = new Set(p); next.delete(id); return next; });
    router.refresh();
  }

  const visible = questions.filter((q) => !done.has(q.id));

  if (visible.length === 0) {
    return <p style={{ color: "#9AA0A6", fontSize: "0.875rem" }}>Queue is empty — nothing to review.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {visible.map((q) => (
        <div key={q.id} className="rounded-xl p-5" style={{ backgroundColor: "#1E2024", border: "1px solid #2C2E33" }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="flex flex-wrap gap-2">
                {[q.syllabus, q.subject, `Grade ${q.grade}`, q.difficulty, q.question_type].map((label) => (
                  <span key={label} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#2C2E33", color: "#9AA0A6" }}>{label}</span>
                ))}
                {q.source && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#1A2040", color: "#8B8FD4" }}>{q.source}</span>
                )}
              </div>
              {q.topic_name && <p className="text-xs" style={{ color: "#9AA0A6" }}>Topic: {q.topic_name} · {q.criterion}</p>}
              <p className="text-sm" style={{ color: "#E8EAED" }}>{questionPreview(q.question_text)}</p>
              <p className="text-xs" style={{ color: "#9AA0A6" }}>{markSchemeText(q.mark_scheme)}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleAction(q.id, "approve")} disabled={processing.has(q.id)} className="px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity" style={{ backgroundColor: "#1A3A2A", color: "#81C995", opacity: processing.has(q.id) ? 0.5 : 1 }}>Approve</button>
              <button onClick={() => handleAction(q.id, "reject")} disabled={processing.has(q.id)} className="px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity" style={{ backgroundColor: "#2C1A1A", color: "#F28B82", opacity: processing.has(q.id) ? 0.5 : 1 }}>Reject</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
