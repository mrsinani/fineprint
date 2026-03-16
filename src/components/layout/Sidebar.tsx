"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Upload,
  FileText,
  Trash2,
  type LucideIcon,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/upload", label: "Upload new", icon: Upload },
  { href: "/documents", label: "My documents", icon: FileText },
] as const;

const secondaryItems = [
  { href: "/trash", label: "Trash", icon: Trash2 },
] as const;

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors duration-150 ${
        active
          ? "bg-navy-850 text-navy-100"
          : "text-navy-400 hover:bg-navy-900 hover:text-navy-200"
      }`}
    >
      <span className={`shrink-0 ${active ? "text-navy-300" : "text-navy-500"}`} aria-hidden>
        <Icon size={18} strokeWidth={1.75} />
      </span>
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside
      className="flex w-52 shrink-0 flex-col border-r border-navy-800 bg-white"
      aria-label="Main navigation"
    >
      {/* User block */}
      <div className="px-4 pb-2 pt-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-white"
            aria-hidden
          >
            OP
          </div>
          <span className="truncate text-sm font-semibold text-navy-100">
            John Doe
          </span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex flex-1 flex-col p-3" aria-label="Primary">
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive(item.href)}
            />
          ))}
        </div>

        <div className="my-3 border-t border-navy-800" role="separator" />

        <div className="flex flex-col gap-0.5">
          {secondaryItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive(item.href)}
            />
          ))}
        </div>

        {/* Push bottom links down */}
        <div className="flex-1" />

        <div className="flex flex-col gap-1 border-t border-navy-800 pt-3">
          <Link
            href="/settings"
            className={`px-3 py-2 text-[13px] font-medium transition-colors ${
              isActive("/settings") ? "text-navy-100" : "text-navy-400 hover:text-navy-200"
            }`}
          >
            Settings
          </Link>
          <Link
            href="/profile"
            className={`px-3 py-2 text-[13px] font-medium transition-colors ${
              isActive("/profile") ? "text-navy-100" : "text-navy-400 hover:text-navy-200"
            }`}
          >
            My Profile
          </Link>
        </div>
      </nav>
    </aside>
  );
}
