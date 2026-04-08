"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { useMarket } from "@/contexts/market-context";
import { useWishlist } from "@/contexts/wishlist-context";
import type { Product } from "@/types/domain";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { formatPrice, t } = useMarket();
  const { isInWishlist, toggleWishlist } = useWishlist();

  return (
    <article className="group relative overflow-hidden rounded-xl border border-border bg-card p-2 shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.14)] sm:p-3">
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        {product.discount ? <Badge variant="danger">-{product.discount}%</Badge> : null}
        {product.featured ? <Badge>Featured</Badge> : null}
      </div>

      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <Image
            src={product.main_image}
            alt={product.name}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="mt-3 space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.category?.name ?? "Category"}
        </p>
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="line-clamp-2 text-sm font-bold sm:text-base">{product.name}</h3>
        </Link>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {product.short_description}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-primary sm:text-lg">
            {formatPrice(product.price)}
          </span>
          {product.old_price ? (
            <span className="text-xs text-muted-foreground line-through sm:text-sm">
              {formatPrice(product.old_price)}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button className="flex-1 px-2 text-xs sm:text-sm" onClick={() => addToCart(product)}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            {t("product.addToCart")}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => toggleWishlist(product)}
            aria-label="Toggle wishlist"
          >
            <Heart
              className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-primary text-primary" : ""}`}
            />
          </Button>
        </div>
      </div>
    </article>
  );
}
