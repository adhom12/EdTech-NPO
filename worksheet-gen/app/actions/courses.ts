'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getDb } from '@/lib/aurora/client'
import { createClient } from '@/lib/supabase/server'

export async function createCourse(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

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
      VALUES (${user.id}, ${label}, ${subject}, ${curriculum_id})
    `
  } catch (err) {
    return { error: String(err) }
  }

  revalidatePath('/')
  redirect('/')
}
