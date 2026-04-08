"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, TrendingUp, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarket } from "@/contexts/market-context";

const iconMap = [Sparkles, TrendingUp, Truck];

export function HeroSlider() {
  const [active, setActive] = useState(0);
  const { locale, t } = useMarket();

  const slides = useMemo(
    () => [
      {
        title:
          locale === "si"
            ? "Global deals, smarter shopping"
            : "Global deals, smarter shopping",
        subtitle:
          locale === "si"
            ? "Verified products, clean checkout, and faster order visibility from one modern marketplace."
            : "Verified products, clean checkout, and faster order visibility from one modern marketplace.",
        cta: t("hero.cta.shop"),
        href: "/products",
      },
      {
        title:
          locale === "si"
            ? "Flash discounts for trending picks"
            : "Flash discounts for trending picks",
        subtitle:
          locale === "si"
            ? "High-demand products with limited windows and transparent pricing."
            : "High-demand products with limited windows and transparent pricing.",
        cta: locale === "si" ? "Flash deals" : "Flash deals",
        href: "/products?sort=featured",
      },
      {
        title:
          locale === "si"
            ? "Built for customers, ready for sellers"
            : "Built for customers, ready for sellers",
        subtitle:
          locale === "si"
            ? "Multi-language, multi-currency experience with admin and seller order pipelines."
            : "Multi-language, multi-currency experience with admin and seller order pipelines.",
        cta: locale === "si" ? "Seller side" : "Seller side",
        href: "/seller",
      },
    ],
    [locale, t],
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 4800);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const slide = slides[active];
  const CardIcon = iconMap[active];

  return (
    <section className="animated-reveal">
      <div className="relative overflow-hidden rounded-3xl border border-[#7d1212]/25 bg-gradient-to-br from-[#570e0e] via-[#7f1d1d] to-[#1f0404] p-6 text-white sm:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-[#ff7b7b]/20 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
              {t("hero.badge")}
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
              {slide.title}
            </h1>
            <p className="mt-4 max-w-xl text-sm text-white/90 sm:text-lg">
              {slide.subtitle}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={slide.href}>
                <Button
                  size="lg"
                  className="bg-white text-[#570e0e] shadow-lg hover:bg-white/90"
                >
                  {slide.cta}
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/70 bg-white/5 text-white hover:bg-white/10"
                >
                  {t("hero.cta.contact")}
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-sm">
            <div className="inline-flex rounded-xl bg-white/15 p-2">
              <CardIcon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-bold">{t("hero.why")}</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/90">
              <li>{t("hero.why.1")}</li>
              <li>{t("hero.why.2")}</li>
              <li>{t("hero.why.3")}</li>
            </ul>
          </div>
        </div>

        <div className="relative mt-6 flex gap-2">
          {slides.map((item, idx) => (
            <button
              key={item.title}
              className={`h-2 rounded-full transition ${
                idx === active ? "w-10 bg-white" : "w-3 bg-white/45"
              }`}
              onClick={() => setActive(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
