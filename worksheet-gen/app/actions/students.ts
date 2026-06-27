'use server'

import { revalidatePath } from 'next/cache'
import { getDb } from '@/lib/aurora/client'

export async function addStudent(formData: FormData) {
  const course_id = formData.get('course_id') as string
  const student_name = (formData.get('student_name') as string)?.trim()
  const student_identifier = (formData.get('student_identifier') as string)?.trim() || null

  if (!course_id || !student_name) return

  try {
    const sql = await getDb()
    await sql`
      INSERT INTO classes (course_id, student_name, student_identifier)
      VALUES (${course_id}, ${student_name}, ${student_identifier})
    `
    revalidatePath(`/courses/${course_id}`)
  } catch {}
}

export async function removeStudent(studentId: string, courseId: string) {
  try {
    const sql = await getDb()
    await sql`DELETE FROM classes WHERE id = ${studentId}`
    revalidatePath(`/courses/${courseId}`)
  } catch {}
}
