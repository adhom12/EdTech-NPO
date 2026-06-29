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
    <div className="max-w-[900px] mx-auto px-8 py-8 animate-page-in">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold tracking-tight" style={{ color: '#47574d' }}>
          Review Queue
        </h1>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: '#f0ede6', color: '#8a9a8f', border: '1px solid #e5e2d9' }}
        >
          {questions.length}
        </span>
      </div>

      <ReviewTable questions={questions as unknown as Parameters<typeof ReviewTable>[0]['questions']} />
    </div>
  );
}
