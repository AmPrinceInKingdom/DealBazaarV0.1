import type { Metadata } from "next";
import Link from "next/link";
import { Pagination } from "@/components/product/pagination";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCategories } from "@/lib/services/categories";
import { getProducts } from "@/lib/services/products";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse all products on Deal Bazaar.",
};

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categories = await getCategories();

  const q = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";
  const minPrice =
    typeof params.minPrice === "string" ? Number(params.minPrice) : undefined;
  const maxPrice =
    typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined;
  const sort =
    typeof params.sort === "string"
      ? (params.sort as "latest" | "price_asc" | "price_desc" | "featured")
      : "latest";
  const page = typeof params.page === "string" ? Number(params.page) : 1;

  const result = await getProducts({
    search: q,
    category,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    sort,
    page,
    pageSize: 12,
  });

  const urlSearchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string") {
      urlSearchParams.set(key, value);
    }
  });

  const buildSortHref = (sortValue: "latest" | "featured" | "price_asc" | "price_desc") => {
    const next = new URLSearchParams(urlSearchParams.toString());
    if (sortValue === "latest") {
      next.delete("sort");
    } else {
      next.set("sort", sortValue);
    }
    next.delete("page");
    const queryString = next.toString();
    return queryString ? `/products?${queryString}` : "/products";
  };

  return (
    <div className="container-wrap py-8">
      <SectionHeading
        title="Products"
        subtitle="Search, filter, and discover products from every category."
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ProductFilters categories={categories} variant="sidebar" />
        </aside>

        <div className="space-y-4">
          <div className="surface flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {result.total} products found
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: "Best Match", value: "latest" as const },
                { label: "Featured", value: "featured" as const },
                { label: "Price ↑", value: "price_asc" as const },
                { label: "Price ↓", value: "price_desc" as const },
              ].map((option) => (
                <Link
                  key={option.value}
                  href={buildSortHref(option.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    sort === option.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>

          <ProductGrid products={result.items} />

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            pathname="/products"
            searchParams={urlSearchParams}
          />
        </div>
      </div>
    </div>
  );
}
