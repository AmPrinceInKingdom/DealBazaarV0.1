import Link from "next/link";
import { ProductMarquee } from "@/components/home/product-marquee";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Product } from "@/types/domain";

export function ProductSection({
  title,
  subtitle,
  products,
  href = "/products",
  actionLabel = "View all",
  variant = "grid",
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  href?: string;
  actionLabel?: string;
  variant?: "grid" | "marquee";
}) {
  return (
    <section className="mt-14 space-y-6">
      <SectionHeading
        title={title}
        subtitle={subtitle}
        action={
          <Link href={href}>
            <Button variant="outline">{actionLabel}</Button>
          </Link>
        }
      />
      {variant === "marquee" ? (
        <ProductMarquee products={products} />
      ) : (
        <ProductGrid products={products} />
      )}
    </section>
  );
}
