"use client";

import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { useMarket } from "@/contexts/market-context";
import { useWishlist } from "@/contexts/wishlist-context";
import type { Product } from "@/types/domain";

export function ProductDetailActions({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { t } = useMarket();
  const { isInWishlist, toggleWishlist } = useWishlist();

  return (
    <div className="flex gap-3">
      <Button
        className="flex-1"
        size="lg"
        onClick={() => addToCart(product)}
        disabled={product.stock_quantity < 1}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {product.stock_quantity < 1 ? t("product.outOfStock") : t("product.addToCart")}
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={() => toggleWishlist(product)}
        aria-label="Toggle wishlist"
      >
        <Heart
          className={`mr-2 h-4 w-4 ${
            isInWishlist(product.id) ? "fill-primary text-primary" : ""
          }`}
        />
        Wishlist
      </Button>
    </div>
  );
}
