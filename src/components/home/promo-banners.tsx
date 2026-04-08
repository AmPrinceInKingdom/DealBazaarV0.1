import Link from "next/link";
import { ArrowRight } from "lucide-react";

const banners = [
  {
    title: "New season arrivals",
    text: "Upgrade your setup with curated modern essentials.",
    href: "/products?sort=latest",
  },
  {
    title: "Business bulk requests",
    text: "Need larger volumes? Contact Deal Bazaar operations.",
    href: "/contact",
  },
];

export function PromoBanners() {
  return (
    <section className="mt-14 grid gap-4 md:grid-cols-2">
      {banners.map((banner) => (
        <Link
          key={banner.title}
          href={banner.href}
          className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/30"
        >
          <h3 className="text-xl font-extrabold">{banner.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{banner.text}</p>
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
            Explore
            <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
      ))}
    </section>
  );
}
