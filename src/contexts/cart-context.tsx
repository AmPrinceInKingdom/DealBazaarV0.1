"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { CartItem, Product } from "@/types/domain";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

const CART_STORAGE_PREFIX = "deal-bazaar-cart";
const GUEST_CART_KEY = `${CART_STORAGE_PREFIX}:guest`;

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  clearCart: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function storageKeyForUser(userId?: string) {
  return `${CART_STORAGE_PREFIX}:${userId ?? "guest"}`;
}

function readCartFromStorage(key: string): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCartToStorage(key: string, items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(items));
}

function mergeCartItems(primary: CartItem[], secondary: CartItem[]) {
  const byId = new Map<string, CartItem>();

  [...primary, ...secondary].forEach((item) => {
    const existing = byId.get(item.id);
    if (existing) {
      byId.set(item.id, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      });
      return;
    }
    byId.set(item.id, item);
  });

  return Array.from(byId.values());
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [storageKey, setStorageKey] = useState<string>(GUEST_CART_KEY);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const supabase = createSupabaseBrowserClient();

    const syncCartForUser = (userId?: string) => {
      const nextKey = storageKeyForUser(userId);

      if (!userId) {
        setStorageKey(nextKey);
        const guestItems = readCartFromStorage(nextKey);
        const sanitizedGuestItems = guestItems.filter((item) => isUuid(item.id));
        if (sanitizedGuestItems.length !== guestItems.length) {
          toast.error("Removed outdated demo items from cart. Please add products again.");
        }
        setItems(sanitizedGuestItems);
        writeCartToStorage(nextKey, sanitizedGuestItems);
        setHasHydrated(true);
        return;
      }

      const userCart = readCartFromStorage(nextKey);
      const guestCart = readCartFromStorage(GUEST_CART_KEY);
      const merged = mergeCartItems(userCart, guestCart);
      const sanitized = merged.filter((item) => isUuid(item.id));
      if (sanitized.length !== merged.length) {
        toast.error("Removed outdated demo items from cart. Please add products again.");
      }

      setStorageKey(nextKey);
      setItems(sanitized);
      writeCartToStorage(nextKey, sanitized);
      if (guestCart.length > 0) {
        localStorage.removeItem(GUEST_CART_KEY);
      }
      setHasHydrated(true);
    };

    if (!supabase) {
      syncCartForUser();
      return;
    }

    let isMounted = true;

    supabase.auth.getUser().then((result: {
      data: { user: { id: string } | null };
      error: { message: string } | null;
    }) => {
      if (!isMounted) return;
      const { data, error } = result;
      const message = error?.message.toLowerCase() ?? "";
      const shouldNotify =
        Boolean(error) &&
        !message.includes("auth session missing") &&
        !message.includes("jwt") &&
        !message.includes("token");
      if (shouldNotify) {
        toast.error("Database issue while loading cart. Using local cart.");
      }
      syncCartForUser(data.user?.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return;
        syncCartForUser(session?.user?.id);
      },
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    try {
      writeCartToStorage(storageKey, items);
    } catch {
      toast.error("Unable to save cart changes.");
    }
  }, [items, storageKey, hasHydrated]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    if (!isUuid(product.id)) {
      toast.error("This product cannot be ordered yet. Please use synced catalog items.");
      return;
    }

    setItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { ...product, quantity }];
    });

    toast.success(`${product.name} added to cart`);
    setIsDrawerOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
    toast.success("Item removed from cart");
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    toast.success("Cart cleared");
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [items],
  );
  const shippingFee = subtotal > 100 ? 0 : subtotal > 0 ? 12 : 0;
  const total = subtotal + shippingFee;

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      total,
      isDrawerOpen,
      openDrawer: () => setIsDrawerOpen(true),
      closeDrawer: () => setIsDrawerOpen(false),
      clearCart,
      addToCart,
      removeFromCart,
      updateQuantity,
    }),
    [
      items,
      itemCount,
      subtotal,
      total,
      isDrawerOpen,
      clearCart,
      addToCart,
      removeFromCart,
      updateQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
