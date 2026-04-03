export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy-900 px-4 py-12">
      <div
        className="mx-auto w-full max-w-md opacity-0"
        style={{
          animation: "fp-fade-in-up 0.55s ease-out forwards",
        }}
      >
        {children}
      </div>
    </div>
  );
}
