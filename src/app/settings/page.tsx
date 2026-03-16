import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl px-8 py-12">
      <h1
        className="font-display text-3xl font-bold tracking-tight text-navy-100 opacity-0 sm:text-4xl"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.1s forwards" }}
      >
        Settings
      </h1>
      <div
        className="mt-10 rounded-xl border border-dashed border-navy-700 py-20 text-center opacity-0"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.25s forwards" }}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-navy-850 text-navy-500">
          <Settings size={24} strokeWidth={1.5} />
        </div>
        <p className="text-sm text-navy-400">
          Settings and preferences coming soon.
        </p>
      </div>
    </div>
  );
}
