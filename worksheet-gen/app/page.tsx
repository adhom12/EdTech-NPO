import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { WorksheetCard, type Worksheet } from "@/components/WorksheetCard";

const MOCK_WORKSHEETS: Worksheet[] = [
  {
    id: "1",
    title: "Forces & Newton's Laws — Structured Questions",
    syllabus: "Cambridge IGCSE",
    subject: "Physics",
    modifiedAt: "2 days ago",
  },
  {
    id: "2",
    title: "Photosynthesis & Respiration — Short Answer Set",
    syllabus: "Cambridge IGCSE",
    subject: "Biology",
    modifiedAt: "5 days ago",
  },
  {
    id: "3",
    title: "Quadratic Equations — Problem Set A",
    syllabus: "Edexcel GCSE",
    subject: "Mathematics",
    modifiedAt: "1 week ago",
  },
  {
    id: "4",
    title: "Cold War Essay Questions — Unit 3",
    syllabus: "IB MYP",
    subject: "History",
    modifiedAt: "2 weeks ago",
  },
  {
    id: "5",
    title: "Organic Chemistry — Functional Groups MCQ",
    syllabus: "Cambridge IGCSE",
    subject: "Chemistry",
    modifiedAt: "3 weeks ago",
  },
  {
    id: "6",
    title: "Supply & Demand Analysis — Case Studies",
    syllabus: "IB DP",
    subject: "Economics",
    modifiedAt: "1 month ago",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#121417" }}>
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-8 py-10">
        {/* Welcome header */}
        <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">
          Good morning, Ms. Johnson 👋
        </h1>

        {/* Hero CTA card — soft indigo tint, no harsh border */}
        <div
          className="rounded-2xl p-10 flex flex-col items-center justify-center mb-12"
          style={{
            backgroundColor: "rgba(63, 68, 110, 0.15)",
            border: "1px solid rgba(77, 82, 138, 0.25)",
          }}
        >
          <Link
            href="/workspace/new"
            className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-opacity hover:opacity-90 mb-2"
            style={{ backgroundColor: "#4D528A" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M7 2v10M2 7h10" />
            </svg>
            Create New Question Set
          </Link>
          <p
            className="text-sm text-center max-w-sm"
            style={{ color: "#9AA0A6" }}
          >
            Generate AI-powered questions and worksheets aligned to any
            syllabus, topic, and difficulty level.
          </p>
        </div>

        {/* Recent worksheets */}
        <section>
          <h2
            className="text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ color: "#9AA0A6" }}
          >
            Your Recent Worksheets
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_WORKSHEETS.map((ws) => (
              <WorksheetCard key={ws.id} worksheet={ws} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
