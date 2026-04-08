"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Category } from "@/types/domain";

export function ProductFilters({
  categories,
  hideCategory,
  variant = "inline",
}: {
  categories: Category[];
  hideCategory?: boolean;
  variant?: "inline" | "sidebar";
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "latest");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");

  const activeFiltersCount = useMemo(() => {
    const entries = [search, minPrice, maxPrice, sort !== "latest" ? sort : "", category];
    return entries.filter(Boolean).length;
  }, [category, maxPrice, minPrice, search, sort]);

  const applyFilters = () => {
    const next = new URLSearchParams(searchParams.toString());
    const setOrDelete = (key: string, value: string) =>
      value ? next.set(key, value) : next.delete(key);

    setOrDelete("q", search.trim());
    setOrDelete("minPrice", minPrice.trim());
    setOrDelete("maxPrice", maxPrice.trim());
    setOrDelete("sort", sort === "latest" ? "" : sort);
    if (!hideCategory) {
      setOrDelete("category", category);
    }
    next.delete("page");

    router.push(next.toString() ? `${pathname}?${next.toString()}` : pathname);
  };

  const clearFilters = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setSort("latest");
    setCategory("");
    router.push(pathname);
  };

  if (variant === "sidebar") {
    return (
      <div className="surface space-y-4 p-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Search
          </p>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Type product name"
          />
        </div>

        {!hideCategory ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Category
            </p>
            <Select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Price range
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="Min"
            />
            <Input
              type="number"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Max"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Sort
          </p>
          <Select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="latest">Latest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="featured">Featured</option>
          </Select>
        </div>

        <div className="grid gap-2">
          <Button onClick={applyFilters}>Apply filters</Button>
          <Button variant="outline" onClick={clearFilters}>
            Reset {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="surface mb-6 grid gap-3 p-4 md:grid-cols-5">
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search products"
      />
      {!hideCategory ? (
        <Select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </Select>
      ) : null}
      <Input
        type="number"
        value={minPrice}
        onChange={(event) => setMinPrice(event.target.value)}
        placeholder="Min price"
      />
      <Input
        type="number"
        value={maxPrice}
        onChange={(event) => setMaxPrice(event.target.value)}
        placeholder="Max price"
      />
      <Select value={sort} onChange={(event) => setSort(event.target.value)}>
        <option value="latest">Latest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="featured">Featured</option>
      </Select>
      <div className="flex gap-2 md:col-span-5">
        <Button onClick={applyFilters}>Apply filters</Button>
        <Button variant="outline" onClick={clearFilters}>
          Reset {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}
        </Button>
      </div>
    </div>
  );
}
