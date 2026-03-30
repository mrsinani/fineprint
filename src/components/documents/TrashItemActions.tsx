"use client";

import { useRouter } from "next/navigation";

interface TrashItemActionsProps {
  id: string;
  filePath: string | null;
}

export function TrashItemActions({ id, filePath }: TrashItemActionsProps) {
  const router = useRouter();

  const handleRestore = async () => {
    await fetch("/api/documents/trash", {
      method: "PATCH",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    });
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm("Permanently delete this document? This cannot be undone.")) return;
    await fetch("/api/documents/trash", {
      method: "DELETE",
      body: JSON.stringify({ id, filePath }),
      headers: { "Content-Type": "application/json" },
    });
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleRestore}
        className="rounded-md px-3 py-1.5 text-[13px] font-medium text-navy-400 transition-colors hover:bg-navy-850 hover:text-navy-200"
      >
        Restore
      </button>
      <button
        type="button"
        onClick={handleDelete}
        className="rounded-md px-3 py-1.5 text-[13px] font-medium text-red-400 transition-colors hover:bg-red-500/10"
      >
        Delete permanently
      </button>
    </div>
  );
}
