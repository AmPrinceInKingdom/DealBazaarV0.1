import { CircleCheck, Globe, LockKeyhole, MessageCircleMore } from "lucide-react";
import { trustBadges } from "@/lib/data";

const icons = [LockKeyhole, Globe, CircleCheck, MessageCircleMore];

export function TrustBadges() {
  return (
    <section className="mt-14 rounded-3xl border border-border bg-muted/30 p-6 sm:p-8">
      <h2 className="text-2xl font-extrabold">Why shop with Deal Bazaar</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {trustBadges.map((badge, idx) => {
          const Icon = icons[idx];
          return (
            <article key={badge.title} className="rounded-xl bg-card p-4">
              <Icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">{badge.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{badge.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
