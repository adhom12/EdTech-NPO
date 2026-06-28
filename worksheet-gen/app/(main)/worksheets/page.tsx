import { getDb } from '@/lib/aurora/client'
import { WorksheetsClient, type WorksheetDoc } from './WorksheetsClient'

const DEV_TEACHER_ID = 'e3987e0e-6bd4-4438-94fe-e821e1f1e0f1'

export default async function WorksheetsPage() {
  const sql = await getDb()

  const rows = await sql`
    SELECT
      w.id,
      w.title,
      w.created_at,
      c.id    AS course_id,
      c.label AS course_label,
      c.subject,
      cu.board,
      cu.qualification
    FROM worksheets w
    JOIN courses c ON w.course_id = c.id
    LEFT JOIN curricula cu ON c.curriculum_id = cu.id
    WHERE c.teacher_id = ${DEV_TEACHER_ID}
    ORDER BY w.created_at DESC
  `

  const worksheets: WorksheetDoc[] = rows.map((r) => ({
    id: r.id as string,
    title: r.title as string,
    courseId: r.course_id as string,
    courseLabel: r.course_label as string,
    subject: r.subject as string,
    board: (r.board as string) ?? null,
    qualification: (r.qualification as string) ?? null,
    createdAt: r.created_at as string,
  }))

  return <WorksheetsClient worksheets={worksheets} />
}
