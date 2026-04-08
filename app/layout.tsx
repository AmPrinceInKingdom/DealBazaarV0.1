import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import {
  getRequestCurrency,
  getRequestLocale,
} from "@/lib/server-locale";

export const metadata: Metadata = {
  metadataBase: new URL("https://deal-bazaar.com"),
  title: {
    default: "Deal Bazaar | Global Marketplace",
    template: "%s | Deal Bazaar",
  },
  description:
    "Deal Bazaar is a modern global dropshipping marketplace with verified products, secure payments, and fast order tracking.",
  keywords: [
    "Deal Bazaar",
    "e-commerce",
    "marketplace",
    "dropshipping",
    "online shopping",
    "global delivery",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [initialLocale, initialCurrency] = await Promise.all([
    getRequestLocale(),
    getRequestCurrency(),
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background text-foreground antialiased"
      >
        <Providers initialLocale={initialLocale} initialCurrency={initialCurrency}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
