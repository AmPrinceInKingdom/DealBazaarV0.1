"use client";

import Link from "next/link";
import { useState } from "react";
import { CircleUserRound, LogOut, Settings, Shield, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarket } from "@/contexts/market-context";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  isSuperAdmin: boolean;
  userName?: string | null;
};

export function UserMenu({
  isAuthenticated,
  isAdmin,
  isSeller,
  isSuperAdmin,
  userName,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const { t } = useMarket();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="text-sm font-semibold hover:text-primary">
          Login
        </Link>
        <Link href="/register">
          <Button size="sm">Register</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={() => setOpen((current) => !current)}
      >
        <CircleUserRound className="h-5 w-5" />
      </Button>

      {open ? (
        <div
          className={cn(
            "absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl",
          )}
        >
          <p className="px-3 py-2 text-xs text-muted-foreground">Signed in as</p>
          <p className="truncate px-3 pb-2 text-sm font-semibold">
            {userName || "Customer"}
          </p>
          <Link href="/account" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted">
            <Settings className="h-4 w-4" />
            {t("user.dashboard")}
          </Link>
          <Link href="/account/orders" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted">
            <Truck className="h-4 w-4" />
            {t("user.orders")}
          </Link>
          {isAdmin ? (
            <Link href="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted">
              <Shield className="h-4 w-4" />
              {t("user.admin")}
            </Link>
          ) : null}
          {isSuperAdmin ? (
            <>
              <Link href="/control" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted">
                <Shield className="h-4 w-4" />
                Control Center
              </Link>
              <Link
                href="/control/coupons"
                className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
              >
                <Shield className="h-4 w-4" />
                Coupon Manager
              </Link>
            </>
          ) : null}
          {isSeller ? (
            <Link href="/seller" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted">
              <Shield className="h-4 w-4" />
              {t("user.seller")}
            </Link>
          ) : null}
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              {t("user.logout")}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
