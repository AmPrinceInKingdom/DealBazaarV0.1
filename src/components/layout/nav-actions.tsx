"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";

type NavActionsProps = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  isSuperAdmin: boolean;
  userName?: string | null;
};

export function NavActions({
  isAuthenticated,
  isAdmin,
  isSeller,
  isSuperAdmin,
  userName,
}: NavActionsProps) {
  const { itemCount, openDrawer } = useCart();

  return (
    <div className="flex items-center gap-1">
      <Link href="/wishlist" aria-label="Wishlist">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Heart className="h-5 w-5" />
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full"
        onClick={openDrawer}
        aria-label="Cart"
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {itemCount}
          </span>
        ) : null}
      </Button>
      <UserMenu
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        isSeller={isSeller}
        isSuperAdmin={isSuperAdmin}
        userName={userName}
      />
    </div>
  );
}
