"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useMarket } from "@/contexts/market-context";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function CartDrawer() {
  const {
    items,
    subtotal,
    total,
    isDrawerOpen,
    closeDrawer,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const { formatPrice, t } = useMarket();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/45 transition-opacity ${
          isDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeDrawer}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md transform flex-col border-l border-border bg-background transition-transform duration-300 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-border p-4">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <ShoppingBag className="h-5 w-5 text-primary" />
            {t("cart.title")}
          </h3>
          <Button size="icon" variant="ghost" onClick={closeDrawer}>
            <X className="h-5 w-5" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <EmptyState
              title="Your cart is empty"
              description="Start adding products to continue checkout."
              action={
                <Link href="/products" onClick={closeDrawer}>
                  <Button size="sm">Browse products</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <article key={item.id} className="rounded-xl border border-border p-3">
                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={item.main_image}
                        alt={item.name}
                        fill
                        unoptimized
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-semibold">{item.name}</h4>
                      <p className="text-sm text-primary">
                        {formatPrice(item.price)}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.id, Math.max(1, item.quantity - 1))
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-danger"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <footer className="border-t border-border p-4">
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-semibold">
                {subtotal > 100 ? "Free" : subtotal > 0 ? formatPrice(12) : "-"}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-base">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-primary">{formatPrice(total)}</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href="/cart" onClick={closeDrawer}>
              <Button variant="outline" className="w-full">
                {t("cart.view")}
              </Button>
            </Link>
            <Link href="/checkout" onClick={closeDrawer}>
              <Button className="w-full">{t("cart.checkout")}</Button>
            </Link>
          </div>
        </footer>
      </aside>
    </>
  );
}
