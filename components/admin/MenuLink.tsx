"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MenuLink({ href, exato, children }: { href: string; exato?: boolean; children: React.ReactNode }) {
  const p = usePathname();
  const ativo = exato ? p === href : p === href || p.startsWith(href + "/");
  return (
    <Link href={href} aria-current={ativo ? "page" : undefined}>
      {children}
    </Link>
  );
}
