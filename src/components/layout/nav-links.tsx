"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { useMarket } from "@/contexts/market-context";
import type { MouseEventHandler } from "react";
import { cn } from "@/lib/utils";

export function NavLinks({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: MouseEventHandler<HTMLAnchorElement>;
}) {
  const { t } = useMarket();
  const pathname = usePathname();

  return (
    <>
      {NAV_LINKS.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/" && pathname?.startsWith(link.href));

        return (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className={cn(
            mobile
              ? "rounded-lg px-3 py-2 text-sm hover:bg-muted"
              : "rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground",
            isActive && !mobile
              ? "bg-primary/10 text-primary"
              : null,
            isActive && mobile
              ? "bg-primary/10 text-primary"
              : null,
          )}
        >
          {t(link.key)}
        </Link>
        );
      })}
    </>
  );
}
