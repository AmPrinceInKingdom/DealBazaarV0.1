import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Product } from "@/types/domain";

export function ProductMarquee({
  products,
  durationClassName = "animate-[dealMarquee_30s_linear_infinite]",
}: {
  products: Product[];
  durationClassName?: string;
}) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        description="Try changing your filters or search terms."
      />
    );
  }

  const loop = [...products, ...products];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card/40 p-3 [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]">
      <div className={`flex w-max gap-3 hover:[animation-play-state:paused] ${durationClassName}`}>
        {loop.map((product, index) => (
          <div
            key={`${product.id}-${index}`}
            className="w-[220px] shrink-0 sm:w-[250px] lg:w-[280px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
