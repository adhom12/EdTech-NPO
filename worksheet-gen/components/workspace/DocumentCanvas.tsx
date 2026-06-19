"use client";

import { renderInline, renderDisplay } from "@/lib/renderMath";
import type { Question } from "@/lib/questions";

interface DocumentCanvasProps {
  worksheetTitle: string;
  parameters: Record<string, string>;
  questions: Question[];
  loadingIds: Set<number>;
  isGenerating?: boolean;
}

function QuestionSkeleton({ marks }: { marks: number }) {
  return (
    <div className="group relative mb-10">
      <div className="flex items-baseline justify-between mb-3">
        <div className="skeleton-bar" style={{ height: "14px", width: "16px" }} />
        <div className="skeleton-bar" style={{ height: "20px", width: "64px" }} />
      </div>
      <div className="pl-4 space-y-3">
        <div className="skeleton-bar" style={{ height: "12px", width: "100%" }} />
        <div className="skeleton-bar" style={{ height: "12px", width: "86%" }} />
        <div className="skeleton-bar" style={{ height: "12px", width: "72%" }} />
        <div
          className="skeleton-bar mx-auto"
          style={{ height: "32px", width: "44%", marginTop: "8px", marginBottom: "8px" }}
        />
        <div className="skeleton-bar" style={{ height: "12px", width: "78%" }} />
      </div>
      <div className="pl-4 mt-4 space-y-3">
        {Array.from({ length: Math.min(marks + 1, 5) }).map((_, i) => (
          <div
            key={i}
            className="w-full"
            style={{ borderBottom: "1px solid #E5E7EB", height: "24px" }}
          />
        ))}
      </div>
    </div>
  );
}

function QuestionBlock({
  q,
  isLoading,
}: {
  q: Question;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <QuestionSkeleton marks={q.marks} />;
  }

  return (
    <div className="question-block group relative mb-10">
      {/* Question header */}
      <div className="flex items-baseline justify-between mb-3">
        <span
          className="text-sm font-bold tracking-tight"
          style={{ fontFamily: "Georgia, serif", color: "#111827" }}
        >
          {q.number}.
        </span>
        <div className="flex items-center gap-2">
          {q.verified === true && (
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}
              title="Verified by teacher"
            >
              ✓ Verified
            </span>
          )}
          {q.verified === false && (
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "#EDE9FE", color: "#6D28D9" }}
              title="AI-generated, not yet verified"
            >
              AI
            </span>
          )}
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{
              backgroundColor: "#F3F4F6",
              color: "#6B7280",
            }}
          >
            [{q.marks} mark{q.marks !== 1 ? "s" : ""}]
          </span>
        </div>
      </div>

      {/* Question content blocks */}
      <div className="space-y-3 pl-4">
        {q.blocks.map((block, i) => {
          if (block.type === "display") {
            const html = renderDisplay(block.math);
            return (
              <div
                key={i}
                className="py-1"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          }
          if (block.type === "subtext") {
            const html = renderInline(block.text);
            return (
              <p
                key={i}
                className="text-sm italic"
                style={{ color: "#6B7280", fontFamily: "Georgia, serif" }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          }
          const html = renderInline(block.text);
          return (
            <p
              key={i}
              className="text-sm leading-relaxed"
              style={{ color: "#1F2937", fontFamily: "Georgia, serif" }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        })}
      </div>

      {/* Answer space lines */}
      <div className="pl-4 mt-4 space-y-3">
        {Array.from({ length: Math.min(q.marks + 1, 5) }).map((_, i) => (
          <div
            key={i}
            className="w-full"
            style={{ borderBottom: "1px solid #E5E7EB", height: "24px" }}
          />
        ))}
      </div>

      {/* Hover actions */}
      <div className="question-hover-actions absolute -bottom-2 left-0 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          className="text-xs font-medium transition-colors"
          style={{ color: "#6B7280" }}
        >
          Regenerate Question
        </button>
        <button
          className="text-xs font-medium transition-colors"
          style={{ color: "#6B7280" }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export function DocumentCanvas({
  worksheetTitle,
  parameters,
  questions,
  loadingIds,
  isGenerating = false,
}: DocumentCanvasProps) {
  const headerMeta = `${parameters.syllabus} ${parameters.subject} · ${parameters.grade} · ${parameters.difficulty}`.toUpperCase();

  return (
    <div
      className="document-canvas-wrapper hide-scrollbar flex-1 overflow-y-scroll"
      style={{ backgroundColor: "#171A20", minWidth: 0 }}
    >
      {/* Elevated paper */}
      <div
        className="print-paper mx-auto my-8 rounded-sm"
        style={{
          backgroundColor: "#FFFFFF",
          color: "#1F2937",
          maxWidth: "700px",
          padding: "56px 64px 80px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.55)",
        }}
      >
        {/* Document header */}
        <div
          className="mb-8 pb-6"
          style={{ borderBottom: "1px solid #E5E7EB" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "#9CA3AF" }}
          >
            {headerMeta}
          </p>
          <h2
            className="text-xl font-bold leading-snug"
            style={{
              fontFamily: "Georgia, serif",
              color: "#111827",
            }}
          >
            {worksheetTitle}
          </h2>
          <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
            Answer all questions. Show all working clearly.
          </p>
        </div>

        {/* Questions */}
        <div>
          {isGenerating
            ? Array.from({ length: 5 }).map((_, i) => (
                <QuestionSkeleton key={i} marks={3} />
              ))
            : questions.map((q) => (
                <QuestionBlock
                  key={q.number}
                  q={q}
                  isLoading={loadingIds.has(q.number)}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
