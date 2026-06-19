import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReviewTable } from "./ReviewTable";

export default async function AdminReviewPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") redirect("/");

  const { data: questions, error } = await supabase
    .from("questions_pending_review")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div style={{ backgroundColor: "#121417", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div className="flex items-center justify-between mb-6">
          <h1 style={{ color: "#E8EAED", fontSize: "1.25rem", fontWeight: 600 }}>
            Review Queue
            <span
              className="ml-2 text-sm font-normal px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#2C2E33", color: "#9AA0A6" }}
            >
              {questions?.length ?? 0}
            </span>
          </h1>
          <a
            href="/"
            className="text-sm"
            style={{ color: "#9AA0A6" }}
          >
            ← Back to dashboard
          </a>
        </div>

        {error ? (
          <p style={{ color: "#F28B82", fontSize: "0.875rem" }}>
            Error loading queue: {error.message}
          </p>
        ) : (
          <ReviewTable questions={questions ?? []} />
        )}
      </div>
    </div>
  );
}
