import Link from "next/link";
import { File } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureUserExists } from "@/lib/ensureUserExists";

export default async function DocumentsPage() {
  const { userId } = await auth();
  await ensureUserExists(userId!);
  const supabase = createAdminClient();

  const { data: rows } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId!)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const documents = (rows ?? []).map((row) => ({
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
      <div
        className="flex items-end justify-between gap-4 opacity-0"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.1s forwards" }}
      >
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-navy-100 sm:text-4xl">
            My documents
          </h1>
          <p className="mt-2 text-[15px] text-navy-400">
            Documents you&apos;ve uploaded for analysis
          </p>
        </div>
        <Link
          href="/upload"
          className="shrink-0 rounded-lg bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-gold-700"
        >
          Upload new
        </Link>
      </div>

      <div
        className="mt-10 opacity-0"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.25s forwards" }}
      >
        {documents.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {documents.map((doc, i) => (
              <li
                key={doc.id}
                className="opacity-0"
                style={{
                  animation: `fp-fade-in-up 0.5s ease-out ${0.3 + i * 0.08}s forwards`,
                }}
              >
                <DocumentCard {...doc} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-navy-700 py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-navy-850 text-navy-500">
              <File size={24} strokeWidth={1.5} />
            </div>
            <p className="text-sm text-navy-400">
              No documents yet. Upload your first contract to get started.
            </p>
            <Link
              href="/upload"
              className="mt-4 inline-block text-sm font-medium text-gold-600 transition-colors hover:text-gold-700"
            >
              Upload new &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
