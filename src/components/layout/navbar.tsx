import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { getAuthContext } from "@/lib/auth";
import { MarketControls } from "@/components/layout/market-controls";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { NavLinks } from "@/components/layout/nav-links";
import { SearchForm } from "@/components/layout/search-form";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NavActions } from "@/components/layout/nav-actions";

export async function Navbar() {
  const auth = await getAuthContext();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container-wrap py-2.5">
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/70 bg-card/80 px-3 py-2 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-xl px-2 py-1 text-xl font-black tracking-tight text-primary transition hover:bg-primary/10 sm:text-2xl"
            >
              {SITE_NAME}
            </Link>
            <nav className="hidden items-center gap-1 rounded-full border border-border bg-background/90 p-1 lg:flex">
              <NavLinks />
            </nav>
          </div>

          <div className="hidden w-full max-w-xl lg:block">
            <SearchForm />
          </div>

          <div className="flex items-center gap-1 rounded-full border border-border bg-background/90 px-1 py-1">
            <div className="hidden md:block md:px-1">
              <MarketControls />
            </div>
            <ThemeToggle />
            <NavActions
              isAuthenticated={Boolean(auth)}
              isAdmin={
                auth?.profile?.role === "admin" ||
                auth?.profile?.role === "super_admin"
              }
              isSeller={
                auth?.profile?.role === "seller" ||
                auth?.profile?.role === "admin" ||
                auth?.profile?.role === "super_admin"
              }
              isSuperAdmin={auth?.profile?.role === "super_admin"}
              userName={auth?.profile?.full_name}
            />
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
