import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { getDb } from "@/lib/aurora/client";

const DEV_TEACHER_ID = 'e3987e0e-6bd4-4438-94fe-e821e1f1e0f1'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  let recentWorksheets: { id: string; title: string }[] = []
  try {
    const sql = await getDb()
    const rows = await sql`
      SELECT w.id, w.title
      FROM worksheets w
      JOIN courses c ON w.course_id = c.id
      WHERE c.teacher_id = ${DEV_TEACHER_ID}
      ORDER BY w.created_at DESC
      LIMIT 7
    `
    recentWorksheets = rows.map((r) => ({
      id: r.id as string,
      title: r.title as string,
    }))
  } catch {}

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#e7e5de" }}>
      <Sidebar recentWorksheets={recentWorksheets} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
