"use client";

import Link from "next/link";
import {
  Camera,
  Globe,
  MessageCircle,
  Music,
  Play,
  Send,
} from "lucide-react";
import { FOOTER_LINKS, SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";
import { useMarket } from "@/contexts/market-context";

const thisYear = new Date().getFullYear();

export function Footer() {
  const { t } = useMarket();

  const iconByShortLabel = {
    FB: Globe,
    IG: Camera,
    TT: Music,
    TG: Send,
    WA: MessageCircle,
    YT: Play,
  } as const;

  return (
    <footer className="mt-16 hidden border-t border-border bg-muted/20 md:block">
      <div className="container-wrap py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <h3 className="text-xl font-black text-primary">{SITE_NAME}</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("footer.description")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SOCIAL_LINKS.map((link) => {
                const Icon = iconByShortLabel[link.shortLabel];
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-semibold">{t("footer.company")}</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold">{t("footer.account")}</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {FOOTER_LINKS.account.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold">{t("footer.policies")}</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
          {thisYear} {SITE_NAME}. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
