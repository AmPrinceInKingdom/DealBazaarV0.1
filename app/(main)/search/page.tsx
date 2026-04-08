import { Pagination } from "@/components/product/pagination";
import Link from "next/link";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCategories } from "@/lib/services/categories";
import { getProducts } from "@/lib/services/products";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q : "";
  const page = typeof query.page === "string" ? Number(query.page) : 1;
  const sort =
    typeof query.sort === "string"
      ? (query.sort as "latest" | "price_asc" | "price_desc" | "featured")
      : "latest";
  const minPrice =
    typeof query.minPrice === "string" ? Number(query.minPrice) : undefined;
  const maxPrice =
    typeof query.maxPrice === "string" ? Number(query.maxPrice) : undefined;
  const category = typeof query.category === "string" ? query.category : "";

  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts({
      search: q,
      page,
      sort,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      category,
      pageSize: 12,
    }),
  ]);

  const urlSearchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
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
    return queryString ? `/search?${queryString}` : "/search";
  };

  return (
    <div className="container-wrap py-8">
      <SectionHeading
        title={q ? `Search results for "${q}"` : "Search products"}
        subtitle={`${result.total} product(s) found`}
      />
      <div className="mt-6 grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ProductFilters categories={categories} variant="sidebar" />
        </aside>

        <div className="space-y-4">
          <div className="surface flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {result.total} matching products
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
            pathname="/search"
            searchParams={urlSearchParams}
          />
        </div>
      </div>
    </div>
  );
}
