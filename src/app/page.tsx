import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          FinePrint
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Next.js + Supabase — ready to build.
        </p>
        <div className="rounded-lg border border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          {user ? (
            <span>Signed in as <strong>{user.email}</strong></span>
          ) : (
            <span>Not signed in — connect Supabase to get started.</span>
          )}
        </div>
      </main>
    </div>
  );
}
