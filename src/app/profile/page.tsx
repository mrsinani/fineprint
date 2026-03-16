export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-5xl px-8 py-12">
      <h1
        className="font-display text-3xl font-bold tracking-tight text-navy-100 opacity-0 sm:text-4xl"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.1s forwards" }}
      >
        My Profile
      </h1>

      <div
        className="mt-10 rounded-xl border border-navy-700 bg-white p-8 opacity-0"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.25s forwards" }}
      >
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-500 text-lg font-bold text-white">
            OP
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-navy-100">
              John Doe
            </h2>
            <p className="mt-0.5 text-sm text-navy-500">
              john.doe@example.com
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-navy-800 pt-6">
          <p className="text-sm text-navy-400">
            Profile and account management coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
