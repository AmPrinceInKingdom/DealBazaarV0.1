"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useMarket } from "@/contexts/market-context";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function CartPageContent() {
  const { items, subtotal, total, removeFromCart, updateQuantity, clearCart } =
    useCart();
  const { formatPrice } = useMarket();

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Explore products and add items to continue checkout."
        action={
          <Link href="/products">
            <Button>Browse products</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="surface p-4">
            <div className="flex gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted">
                <Image
                  src={item.main_image}
                  alt={item.name}
                  fill
                  unoptimized
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold sm:text-base">{item.name}</h3>
                <p className="mt-1 text-sm text-primary">{formatPrice(item.price)}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() =>
                        updateQuantity(item.id, Math.max(1, item.quantity - 1))
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="min-w-10 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <button
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-danger"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="surface h-fit p-5">
        <h2 className="text-lg font-bold">Order Summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{subtotal > 100 ? "Free" : formatPrice(12)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2 text-base font-bold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
        </div>
        <div className="mt-5 grid gap-2">
          <Link href="/checkout">
            <Button className="w-full">Proceed to checkout</Button>
          </Link>
          <Button variant="outline" onClick={clearCart}>
            Clear cart
          </Button>
        </div>
      </aside>
    </div>
  );
}
