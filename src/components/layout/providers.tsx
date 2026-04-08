"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { CartProvider } from "@/contexts/cart-context";
import { MarketProvider } from "@/contexts/market-context";
import { WishlistProvider } from "@/contexts/wishlist-context";
import type { LocaleCode } from "@/lib/i18n";
import type { CurrencyCode } from "@/lib/market";

export function Providers({
  children,
  initialLocale,
  initialCurrency,
}: {
  children: React.ReactNode;
  initialLocale: LocaleCode;
  initialCurrency: CurrencyCode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <MarketProvider
        initialLocale={initialLocale}
        initialCurrency={initialCurrency}
      >
        <WishlistProvider>
          <CartProvider>
            {children}
            <Toaster richColors position="top-right" />
          </CartProvider>
        </WishlistProvider>
      </MarketProvider>
    </ThemeProvider>
  );
}
