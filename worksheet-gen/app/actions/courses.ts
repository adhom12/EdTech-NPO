'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getDb } from '@/lib/aurora/client'

const DEV_TEACHER_ID = 'e3987e0e-6bd4-4438-94fe-e821e1f1e0f1'

export async function createCourse(formData: FormData) {
  const label = (formData.get('label') as string)?.trim()
  const subject = (formData.get('subject') as string)?.trim()
  const curriculum_id = formData.get('curriculum_id') as string

  if (!label || !subject || !curriculum_id) {
    return { error: 'All fields are required' }
  }

  try {
    const sql = await getDb()
    await sql`
      INSERT INTO courses (teacher_id, label, subject, curriculum_id)
      VALUES (${DEV_TEACHER_ID}, ${label}, ${subject}, ${curriculum_id})
    `
  } catch (err) {
    return { error: String(err) }
  }

  revalidatePath('/')
  revalidatePath('/worksheets')
  revalidatePath('/courses')
  redirect('/')
}

export async function deleteCourse(id: string) {
  try {
    const sql = await getDb()
    // Unlink worksheets so they survive in the worksheets tab
    await sql`UPDATE worksheets SET course_id = NULL WHERE course_id = ${id}`
    await sql`DELETE FROM courses WHERE id = ${id} AND teacher_id = ${DEV_TEACHER_ID}`
    revalidatePath('/courses')
    revalidatePath('/')
    revalidatePath('/worksheets')
  } catch (err) {
    return { error: String(err) }
  }
}
