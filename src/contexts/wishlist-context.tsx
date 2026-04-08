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
import type { Product } from "@/types/domain";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

const WISHLIST_STORAGE_PREFIX = "deal-bazaar-wishlist";

type WishlistContextValue = {
  items: Product[];
  itemIds: Set<string>;
  isLoading: boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined,
);

function storageKeyForUser(userId?: string) {
  return `${WISHLIST_STORAGE_PREFIX}:${userId ?? "guest"}`;
}

function readWishlistFromStorage(key: string): Product[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as Product[]) : [];
  } catch {
    return [];
  }
}

function writeWishlistToStorage(key: string, products: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(products));
}

function uniqueProducts(products: Product[]) {
  const map = new Map<string, Product>();
  products.forEach((product) => {
    map.set(product.id, product);
  });
  return Array.from(map.values());
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [storageKey, setStorageKey] = useState(storageKeyForUser());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const supabase = createSupabaseBrowserClient();

    const syncWishlist = async (nextUserId?: string) => {
      const nextStorageKey = storageKeyForUser(nextUserId);
      setStorageKey(nextStorageKey);
      setUserId(nextUserId ?? null);

      if (!supabase || !nextUserId) {
        const originalLocalItems = readWishlistFromStorage(nextStorageKey);
        const localOnlyItems = originalLocalItems.filter((item) => isUuid(item.id));
        if (localOnlyItems.length !== originalLocalItems.length) {
          toast.error("Removed outdated demo items from wishlist.");
        }
        setItems(localOnlyItems);
        writeWishlistToStorage(nextStorageKey, localOnlyItems);
        setIsLoading(false);
        return;
      }

      const localItems = readWishlistFromStorage(nextStorageKey).filter((item) =>
        isUuid(item.id),
      );
      const { data, error } = await supabase
        .from("wishlist")
        .select("product:products(*)")
        .eq("user_id", nextUserId);

      if (error) {
        toast.error("Database issue while loading wishlist. Showing local wishlist.");
        setItems(localItems);
        setIsLoading(false);
        return;
      }

      const dbItems = (data ?? [])
        .map((row: unknown) => (row as { product: Product | null }).product)
        .filter((product: Product | null): product is Product => Boolean(product));

      const mergedItems = uniqueProducts([...dbItems, ...localItems]);
      setItems(mergedItems);
      writeWishlistToStorage(nextStorageKey, mergedItems);

      const dbItemIds = new Set(dbItems.map((product: Product) => product.id));
      const missingInDb = mergedItems
        .filter((product: Product) => !dbItemIds.has(product.id))
        .map((product: Product) => ({ user_id: nextUserId, product_id: product.id }));

      if (missingInDb.length) {
        const { error: syncError } = await supabase
          .from("wishlist")
          .insert(missingInDb);
        if (syncError) {
          toast.error("Database issue while syncing wishlist.");
        }
      }

      setIsLoading(false);
    };

    let isMounted = true;

    if (!supabase) {
      void syncWishlist();
      return;
    }

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
        toast.error("Database issue while checking user. Using local wishlist.");
      }
      void syncWishlist(data.user?.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return;
        setIsLoading(true);
        void syncWishlist(session?.user?.id);
      },
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    try {
      writeWishlistToStorage(storageKey, items);
    } catch {
      toast.error("Unable to save wishlist locally.");
    }
  }, [items, storageKey, isLoading]);

  const toggleWishlist = useCallback(
    async (product: Product) => {
      if (!isUuid(product.id)) {
        toast.error("This demo product cannot be saved to wishlist.");
        return;
      }

      const exists = items.some((item) => item.id === product.id);
      const nextItems = exists
        ? items.filter((item) => item.id !== product.id)
        : [...items, product];

      setItems(nextItems);
      toast.success(exists ? "Removed from wishlist" : "Added to wishlist");

      const supabase = createSupabaseBrowserClient();
      if (!supabase || !userId) {
        return;
      }

      const query = exists
        ? supabase
            .from("wishlist")
            .delete()
            .eq("user_id", userId)
            .eq("product_id", product.id)
        : supabase.from("wishlist").insert({
            user_id: userId,
            product_id: product.id,
          });

      const { error } = await query;
      if (error) {
        setItems(items);
        toast.error("Database issue while updating wishlist. Rolled back change.");
      }
    },
    [items, userId],
  );

  const removeFromWishlist = useCallback(
    async (id: string) => {
      const previousItems = items;
      const nextItems = items.filter((item) => item.id !== id);
      setItems(nextItems);

      const supabase = createSupabaseBrowserClient();
      if (!supabase || !userId) {
        return;
      }

      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", id);

      if (error) {
        setItems(previousItems);
        toast.error("Database issue while removing wishlist item.");
      }
    },
    [items, userId],
  );

  const itemIds = useMemo(() => new Set(items.map((item) => item.id)), [items]);

  const value = useMemo(
    () => ({
      items,
      itemIds,
      isLoading,
      toggleWishlist,
      removeFromWishlist,
      isInWishlist: (id: string) => itemIds.has(id),
    }),
    [items, itemIds, isLoading, toggleWishlist, removeFromWishlist],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }

  return context;
}
