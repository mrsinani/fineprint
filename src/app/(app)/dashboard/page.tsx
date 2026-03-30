import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureUserExists } from "@/lib/ensureUserExists";
import {
  RiskAnalysisCard,
  MyDocumentsSection,
} from "@/components/dashboard";

export default async function DashboardPage() {
  const { userId } = await auth();
  await ensureUserExists(userId!);
  const supabase = createAdminClient();

  const { data: rows } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId!)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(5);

  const recentDocs = (rows ?? []).map((row) => ({
    id: row.id as string,
    title: (row.title as string) ?? row.file_name ?? "Untitled",
    fileName: row.file_name as string | undefined,
    fileType: row.file_type as string | undefined,
    pages: row.page_count as number | undefined,
    createdAt: new Date(row.created_at as string).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));

  return (
    <div className="mx-auto max-w-5xl px-8 py-12">
      <h1
        className="font-display text-3xl font-bold tracking-tight text-navy-50 opacity-0 sm:text-4xl"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.1s forwards" }}
      >
        My Dashboard
      </h1>

      <div
        className="mt-8 opacity-0"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.2s forwards" }}
      >
        <RiskAnalysisCard />
      </div>

      <div
        className="mt-10 opacity-0"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.3s forwards" }}
      >
        <MyDocumentsSection documents={recentDocs} />
      </div>
    </div>
  );
}
