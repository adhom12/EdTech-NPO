import { redirect } from 'next/navigation'
import { createWorksheet } from '@/app/actions/worksheets'

export default async function NewWorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ course_id?: string }>
}) {
  const { course_id } = await searchParams

  if (!course_id) redirect('/')

  const result = await createWorksheet(course_id, 'New Question Set')

  if ('error' in result) redirect(`/courses/${course_id}`)

  redirect(`/workspace/${result.id}`)
}
