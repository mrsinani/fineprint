import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy-900 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center">
          <Image
            src="/logo.png"
            alt="FinePrint"
            width={64}
            height={52}
            className="w-[52px] opacity-0"
            style={{ height: "auto", animation: "fp-fade-in-up 0.45s ease-out forwards" }}
            priority
          />
        </Link>
        <div
          className="opacity-0"
          style={{
            animation: "fp-fade-in-up 0.55s ease-out 0.08s forwards",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
