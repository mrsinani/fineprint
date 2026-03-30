import { Trash2 } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureUserExists } from "@/lib/ensureUserExists";
import { TrashItemActions } from "@/components/documents/TrashItemActions";

export default async function TrashPage() {
  const { userId } = await auth();
  await ensureUserExists(userId!);
  const supabase = createAdminClient();

  const { data: rows } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId!)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  const trashedDocs = rows ?? [];

  return (
    <div className="mx-auto max-w-5xl px-8 py-12">
      <h1
        className="font-display text-3xl font-bold tracking-tight text-navy-100 opacity-0 sm:text-4xl"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.1s forwards" }}
      >
        Trash
      </h1>

      {trashedDocs.length === 0 ? (
        <div
          className="mt-10 rounded-xl border border-dashed border-navy-700 py-20 text-center opacity-0"
          style={{ animation: "fp-fade-in-up 0.6s ease-out 0.25s forwards" }}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-navy-850 text-navy-500">
            <Trash2 size={24} strokeWidth={1.5} />
          </div>
          <p className="text-sm text-navy-400">
            Your trash is empty. Deleted documents will appear here.
          </p>
        </div>
      ) : (
        <div
          className="mt-10 flex flex-col gap-3 opacity-0"
          style={{ animation: "fp-fade-in-up 0.6s ease-out 0.25s forwards" }}
        >
          {trashedDocs.map((doc) => (
            <div
              key={doc.id as string}
              className="flex items-center justify-between rounded-xl border border-navy-700 bg-white px-5 py-4"
            >
              <div>
                <p className="text-sm font-semibold text-navy-100">
                  {(doc.title as string) ?? (doc.file_name as string) ?? "Untitled"}
                </p>
                {doc.file_name && (
                  <p className="mt-0.5 text-xs text-navy-500">{doc.file_name as string}</p>
                )}
                {doc.file_type && (
                  <p className="mt-0.5 text-xs text-navy-500">{doc.file_type as string}</p>
                )}
                <p className="mt-1 text-xs text-navy-500">
                  Deleted:{" "}
                  {new Date(doc.deleted_at as string).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <TrashItemActions
                id={doc.id as string}
                filePath={doc.file_path as string | null}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
