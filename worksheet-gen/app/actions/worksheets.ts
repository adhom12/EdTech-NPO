'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'

export async function createWorksheet(courseId: string, title: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('worksheets')
    .insert({ course_id: courseId, title })
    .select('id')
    .single()
  if (error) return { error: error.message }
  return { id: data.id as string }
}

export async function deleteWorksheet(id: string, courseId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('worksheets').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/courses/${courseId}`)
}
