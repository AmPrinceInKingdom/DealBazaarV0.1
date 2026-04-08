"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { MarketControls } from "@/components/layout/market-controls";
import { NavLinks } from "@/components/layout/nav-links";
import { SearchForm } from "@/components/layout/search-form";
import { Button } from "@/components/ui/button";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      if (panelRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;

      setOpen(false);
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div className="relative lg:hidden">
      <Button
        ref={buttonRef}
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label="Open menu"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />
      ) : null}

      {open ? (
        <div
          ref={panelRef}
          className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur"
        >
          <div className="mb-3 md:hidden">
            <SearchForm />
          </div>
          <div className="mb-3">
            <MarketControls compact />
          </div>
          <div className="grid gap-2">
            <NavLinks mobile onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
