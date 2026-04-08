"use client";

import { useMarket } from "@/contexts/market-context";

export function ProductPrice({
  price,
  oldPrice,
}: {
  price: number;
  oldPrice?: number | null;
}) {
  const { formatPrice } = useMarket();

  return (
    <div className="flex items-center gap-3">
      <p className="text-3xl font-black text-primary">{formatPrice(price)}</p>
      {oldPrice ? (
        <p className="text-lg text-muted-foreground line-through">
          {formatPrice(oldPrice)}
        </p>
      ) : null}
    </div>
  );
}
