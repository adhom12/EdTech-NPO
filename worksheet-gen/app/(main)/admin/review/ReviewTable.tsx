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
    return (
      <p className="text-sm" style={{ color: '#b0bfb4' }}>
        Queue is empty — nothing to review.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {visible.map((q) => (
        <div
          key={q.id}
          className="rounded-xl p-5"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(71,87,77,0.1)',
            boxShadow: '0 1px 3px rgba(71,87,77,0.08)',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2 flex-1 min-w-0">

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {[q.syllabus, q.subject, `Grade ${q.grade}`, q.difficulty, q.question_type].map((label) => (
                  <span
                    key={label}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#f0ede6', color: '#8a9a8f', border: '1px solid #e5e2d9' }}
                  >
                    {label}
                  </span>
                ))}
                {q.source && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#fdf0e9', color: '#e8753b', border: '1px solid rgba(232,117,59,0.25)' }}
                  >
                    {q.source}
                  </span>
                )}
              </div>

              {/* Topic / criterion */}
              {q.topic_name && (
                <p className="text-xs" style={{ color: '#b0bfb4' }}>
                  {q.topic_name} · {q.criterion}
                </p>
              )}

              {/* Question preview */}
              <p className="text-sm font-medium" style={{ color: '#47574d' }}>
                {questionPreview(q.question_text)}
              </p>

              {/* Mark scheme */}
              <p className="text-xs" style={{ color: '#8a9a8f' }}>
                {markSchemeText(q.mark_scheme)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleAction(q.id, "approve")}
                disabled={processing.has(q.id)}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0',
                  opacity: processing.has(q.id) ? 0.5 : 1,
                  cursor: processing.has(q.id) ? 'wait' : 'pointer',
                }}
                onMouseEnter={(e) => { if (!processing.has(q.id)) e.currentTarget.style.backgroundColor = '#dcfce7' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4' }}
              >
                Approve
              </button>
              <button
                onClick={() => handleAction(q.id, "reject")}
                disabled={processing.has(q.id)}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: '#fff1f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  opacity: processing.has(q.id) ? 0.5 : 1,
                  cursor: processing.has(q.id) ? 'wait' : 'pointer',
                }}
                onMouseEnter={(e) => { if (!processing.has(q.id)) e.currentTarget.style.backgroundColor = '#fee2e2' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff1f2' }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
