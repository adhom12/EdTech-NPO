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

export async function renameWorksheet(id: string, title: string) {
  try {
    const sql = await getDb()
    await sql`UPDATE worksheets SET title = ${title} WHERE id = ${id}`
    revalidatePath('/')
    revalidatePath('/worksheets')
  } catch (err) {
    return { error: String(err) }
  }
}

export async function assignWorksheetToCourse(worksheetId: string, newCourseId: string) {
  try {
    const sql = await getDb()
    await sql`UPDATE worksheets SET course_id = ${newCourseId} WHERE id = ${worksheetId}`
    revalidatePath('/worksheets')
    revalidatePath('/')
  } catch (err) {
    return { error: String(err) }
  }
}
