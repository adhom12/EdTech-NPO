"use client";

import { renderInline, renderDisplay } from "@/lib/renderMath";
import type { Question } from "@/lib/questions";

interface DocumentCanvasProps {
  worksheetTitle: string;
  parameters: Record<string, string>;
  questions: Question[];
  loadingIds: Set<number>;
  isGenerating?: boolean;
  selectedQuestionNumber?: number | null;
  onSelectQuestion?: (n: number | null) => void;
  onFlag?: (questionId: string) => void;
  onRegenerate?: (questionNumber: number) => void;
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
            style={{ borderBottom: "1px solid #e5e2d9", height: "24px" }}
          />
        ))}
      </div>
    </div>
  );
}

function QuestionBlock({
  q,
  isLoading,
  isSelected,
  onSelect,
  onFlag,
  onRegenerate,
}: {
  q: Question;
  isLoading: boolean;
  isSelected: boolean;
  onSelect: (n: number | null) => void;
  onFlag?: (questionId: string) => void;
  onRegenerate?: (questionNumber: number) => void;
}) {
  if (isLoading) {
    return <QuestionSkeleton marks={q.marks} />;
  }

  return (
    <div
      className="question-block group relative mb-10 pb-6 rounded-md"
      style={{
        cursor: isSelected ? "default" : "pointer",
        backgroundColor: isSelected ? "rgba(232,117,59,0.05)" : "transparent",
        outline: isSelected ? "1.5px solid rgba(232,117,59,0.22)" : "1.5px solid transparent",
        transition: "background-color 150ms ease, outline-color 150ms ease",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(isSelected ? null : q.number);
      }}
    >
      {/* Question header */}
      <div className="flex items-baseline justify-between mb-3">
        <span
          className="text-sm font-bold tracking-tight"
          style={{ fontFamily: "Georgia, serif", color: "#47574d" }}
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
              backgroundColor: "#f0ede6",
              color: "#6b7b70",
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
                style={{ color: "#6b7b70", fontFamily: "Georgia, serif" }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          }
          const html = renderInline(block.text);
          return (
            <p
              key={i}
              className="text-sm leading-relaxed"
              style={{ color: "#47574d", fontFamily: "Georgia, serif" }}
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
            style={{ borderBottom: "1px solid #e5e2d9", height: "24px" }}
          />
        ))}
      </div>

      {/* Actions — always visible when selected, hover-only otherwise */}
      <div
        className={`question-hover-actions absolute -bottom-2 left-0 flex items-center gap-4 transition-opacity duration-150 ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {onRegenerate && (
          <button
            onClick={() => onRegenerate(q.number)}
            className="text-xs font-medium transition-colors"
            style={{ color: isSelected ? "#47574d" : "#6b7b70" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#e8753b"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = isSelected ? "#47574d" : "#6b7b70"; }}
          >
            ↻ Regenerate
          </button>
        )}
        {onFlag && q.id && q.verified === false && (
          <button
            onClick={() => onFlag(q.id!)}
            className="text-xs font-medium transition-colors"
            style={{ color: isSelected ? "#47574d" : "#6b7b70" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#F28B82"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = isSelected ? "#47574d" : "#6b7b70"; }}
          >
            ⚑ Flag
          </button>
        )}
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
  selectedQuestionNumber,
  onSelectQuestion,
  onFlag,
  onRegenerate,
}: DocumentCanvasProps) {
  const headerMeta = `${parameters.syllabus} ${parameters.subject} · ${parameters.grade} · ${parameters.difficulty}`.toUpperCase();

  return (
    <div
      className="document-canvas-wrapper hide-scrollbar flex-1 overflow-y-scroll"
      style={{ backgroundColor: "#e7e5de", minWidth: 0 }}
    >
      {/* Elevated paper — clicking the background deselects */}
      <div
        className="print-paper mx-auto my-8 rounded-sm"
        style={{
          backgroundColor: "#FFFFFF",
          color: "#47574d",
          maxWidth: "700px",
          padding: "56px 64px 80px",
          boxShadow: "0 4px 32px rgba(71,87,77,0.18), 0 1px 8px rgba(71,87,77,0.10)",
        }}
        onClick={() => onSelectQuestion?.(null)}
      >
        {/* Document header */}
        <div
          className="mb-8 pb-6"
          style={{ borderBottom: "1px solid #e5e2d9" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "#8a9a8f" }}
          >
            {headerMeta}
          </p>
          <h2
            className="text-xl font-bold leading-snug"
            style={{
              fontFamily: "Georgia, serif",
              color: "#47574d",
            }}
          >
            {worksheetTitle}
          </h2>
          <p className="mt-2 text-sm" style={{ color: "#6b7b70" }}>
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
                  isSelected={selectedQuestionNumber === q.number}
                  onSelect={onSelectQuestion ?? (() => {})}
                  onFlag={onFlag}
                  onRegenerate={onRegenerate}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
