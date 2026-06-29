export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getDb } from '@/lib/aurora/client'
import { CourseTabView } from './CourseTabView'
import { ClassReports } from './ClassReports'
import type { Worksheet } from '@/components/WorksheetCard'

function formatRelative(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months !== 1 ? 's' : ''} ago`
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ sort?: string; tab?: string }>
}) {
  const [{ id }, { sort = 'newest', tab }] = await Promise.all([params, searchParams])
  const initialTab = (['students', 'reports'].includes(tab ?? '') ? tab! : 'overview') as 'overview' | 'students' | 'reports'

  const sql = await getDb()

  const [courseRows, worksheetRows, studentRows, eventRows] = await Promise.all([
    sql`
      SELECT
        c.id, c.label, c.subject,
        cu.id AS curriculum_id, cu.board, cu.qualification, cu.syllabus_code
      FROM courses c
      LEFT JOIN curricula cu ON c.curriculum_id = cu.id
      WHERE c.id = ${id}
      LIMIT 1
    `,
    sql`
      SELECT id, title, created_at
      FROM worksheets
      WHERE course_id = ${id}
      ORDER BY created_at DESC
    `,
    sql`
      SELECT id, student_name, student_identifier
      FROM classes
      WHERE course_id = ${id}
      ORDER BY created_at ASC
    `,
    sql`
      SELECT event_type, payload, created_at
      FROM analytics_events
      WHERE course_id = ${id}
      ORDER BY created_at DESC
      LIMIT 20
    `,
  ])

  if (!courseRows.length) notFound()

  const course = courseRows[0]
  const syllabusLabel = course.board ? `${course.board} ${course.qualification}` : ''

  let suggestedTopics: string[] = []
  if (!worksheetRows.length && course.curriculum_id) {
    const topicRows = await sql`
      SELECT DISTINCT topic
      FROM skills
      WHERE curriculum_id = ${course.curriculum_id as string}
      ORDER BY topic
      LIMIT 200
    `
    suggestedTopics = topicRows.map((r) => r.topic as string).slice(0, 8)
  }

  const allWorksheets: Worksheet[] = worksheetRows.map((ws) => ({
    id: ws.id as string,
    courseId: id,
    title: ws.title as string,
    syllabus: syllabusLabel,
    subject: course.subject as string,
    modifiedAt: formatRelative(ws.created_at as string),
  }))

  const sorted = [...allWorksheets]
  if (sort === 'oldest') sorted.reverse()
  else if (sort === 'az') sorted.sort((a, b) => a.title.localeCompare(b.title))
  else if (sort === 'za') sorted.sort((a, b) => b.title.localeCompare(a.title))

  const students = studentRows.map((s) => ({
    id: s.id as string,
    student_name: s.student_name as string,
    student_identifier: (s.student_identifier as string | null) ?? null,
  }))

  const events = eventRows.map((ev) => ({
    event_type: ev.event_type as string,
    payload: (ev.payload ?? {}) as Record<string, unknown>,
    created_at: ev.created_at as string,
  }))

  return (
    <div className="animate-page-in">
      <CourseTabView
        courseId={id}
        initialTab={initialTab}
        course={{
          label: course.label as string,
          subject: course.subject as string,
          board: (course.board as string | null) ?? null,
          qualification: (course.qualification as string | null) ?? null,
          syllabus_code: (course.syllabus_code as string | null) ?? null,
        }}
        sortedWorksheets={sorted}
        students={students}
        events={events}
        suggestedTopics={suggestedTopics}
        sort={sort}
        reportsNode={
          <ClassReports
            courseId={id}
            worksheets={worksheetRows.map((w) => ({
              id: w.id as string,
              title: w.title as string,
              createdAt: w.created_at as string,
            }))}
            students={students}
          />
        }
      />
    </div>
  )
}
