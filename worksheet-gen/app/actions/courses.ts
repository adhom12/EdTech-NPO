'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'

// Replace with supabase.auth.getUser() once auth is wired up
const DEV_TEACHER_ID = 'e3987e0e-6bd4-4438-94fe-e821e1f1e0f1'

export async function createCourse(formData: FormData) {
  const label = (formData.get('label') as string)?.trim()
  const subject = (formData.get('subject') as string)?.trim()
  const curriculum_id = formData.get('curriculum_id') as string

  if (!label || !subject || !curriculum_id) {
    return { error: 'All fields are required' }
  }

  const supabase = createAdminClient()

  const { error } = await supabase.from('courses').insert({
    teacher_id: DEV_TEACHER_ID,
    label,
    subject,
    curriculum_id,
  })

  if (error) return { error: error.message }

  redirect('/')
}
