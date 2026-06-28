export const dynamic = 'force-dynamic';

import { getDb } from "@/lib/aurora/client";
import { ReviewTable } from "./ReviewTable";

export default async function AdminReviewPage() {
  const sql = await getDb();

  const questions = await sql`
    SELECT
      q.id, q.syllabus, q.subject, q.grade, q.criterion, q.difficulty,
      q.question_type, q.question_text, q.mark_scheme, q.source,
      t.name AS topic_name
    FROM questions q
    LEFT JOIN topics t ON q.topic_id = t.id
    WHERE q.verified = false
    ORDER BY q.created_at DESC
  `;

  return (
    <div className="max-w-[900px] mx-auto px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ color: "#E8EAED", fontSize: "1.25rem", fontWeight: 600 }}>
          Review Queue
          <span
            className="ml-2 text-sm font-normal px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#2C2E33", color: "#9AA0A6" }}
          >
            {questions.length}
          </span>
        </h1>
      </div>

      <ReviewTable questions={questions as unknown as Parameters<typeof ReviewTable>[0]['questions']} />
    </div>
  );
}
