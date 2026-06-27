import "katex/dist/katex.min.css";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceClient } from "@/components/workspace/WorkspaceClient";
import { getDb } from "@/lib/aurora/client";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sql = await getDb();
  const rows = await sql`
    SELECT w.title, w.course_id, c.curriculum_id
    FROM worksheets w
    LEFT JOIN courses c ON w.course_id = c.id
    WHERE w.id = ${id}
    LIMIT 1
  `;

  const row = rows[0];
  const title = (row?.title as string) ?? "Untitled Worksheet";
  const backHref = row?.course_id ? `/courses/${row.course_id as string}` : "/";
  const curriculumId = (row?.curriculum_id as string) ?? null;

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100vh", backgroundColor: "#121417" }}
    >
      <WorkspaceHeader title={title} backHref={backHref} />
      <div className="workspace-columns flex flex-1 overflow-hidden">
        <WorkspaceClient worksheetTitle={title} curriculumId={curriculumId} />
      </div>
    </div>
  );
}
