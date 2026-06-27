'use server'

import { revalidatePath } from 'next/cache'
import { getDb } from '@/lib/aurora/client'

export async function createWorksheet(courseId: string, title: string) {
  try {
    const sql = await getDb()
    const rows = await sql`
      INSERT INTO worksheets (course_id, title)
      VALUES (${courseId}, ${title})
      RETURNING id
    `
    return { id: rows[0].id as string }
  } catch (err) {
    return { error: String(err) }
  }
}

export async function deleteWorksheet(id: string, courseId: string) {
  try {
    const sql = await getDb()
    await sql`DELETE FROM worksheets WHERE id = ${id}`
    revalidatePath(`/courses/${courseId}`)
  } catch (err) {
    return { error: String(err) }
  }
}
