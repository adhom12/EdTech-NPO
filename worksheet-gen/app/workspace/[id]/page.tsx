import "katex/dist/katex.min.css";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceClient } from "@/components/workspace/WorkspaceClient";
import { createClient } from "@/lib/supabase/server";

const WORKSHEET_TITLES: Record<string, string> = {
  "1": "Forces & Newton's Laws — Structured Questions",
  "2": "Photosynthesis & Respiration — Short Answer Set",
  "3": "Quadratic Equations — Problem Set A",
  "4": "Cold War Essay Questions — Unit 3",
  "5": "Organic Chemistry — Functional Groups MCQ",
  "6": "Supply & Demand Analysis — Case Studies",
};

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: worksheet } = await supabase
    .from("worksheets")
    .select("title, course_id")
    .eq("id", id)
    .single();

  const title = worksheet?.title ?? WORKSHEET_TITLES[id] ?? "Untitled Worksheet";
  const backHref = worksheet?.course_id ? `/courses/${worksheet.course_id}` : "/";

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100vh", backgroundColor: "#121417" }}
    >
      <WorkspaceHeader title={title} backHref={backHref} />

      <div className="workspace-columns flex flex-1 overflow-hidden">
        <WorkspaceClient worksheetTitle={title} />
      </div>
    </div>
  );
}
