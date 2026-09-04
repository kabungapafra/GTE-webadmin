"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  href,
  label,
  badge,
}: {
  href: string;
  label: string;
  badge?: number;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={
        "flex items-center justify-between px-2.5 py-1.5 rounded text-sm transition-colors " +
        (active ? "bg-[#33513F] text-[#F7F1E3] font-medium" : "text-[#C9D6C4] hover:bg-[#26402F]")
      }
    >
      <span>{label}</span>
      {!!badge && (
        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#C99A34] text-[#1E3A2B] text-[10px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </Link>
  );
}
