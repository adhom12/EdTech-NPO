import "katex/dist/katex.min.css";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceClient } from "@/components/workspace/WorkspaceClient";

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
  const title = WORKSHEET_TITLES[id] ?? "Untitled Worksheet";

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100vh", backgroundColor: "#121417" }}
    >
      <WorkspaceHeader title={title} />

      <div className="workspace-columns flex flex-1 overflow-hidden">
        <WorkspaceClient worksheetTitle={title} />
      </div>
    </div>
  );
}
