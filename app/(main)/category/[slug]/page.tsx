import { notFound } from "next/navigation";
import Link from "next/link";
import { Pagination } from "@/components/product/pagination";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCategoryBySlug, getCategories } from "@/lib/services/categories";
import { getProducts } from "@/lib/services/products";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const minPrice =
    typeof query.minPrice === "string" ? Number(query.minPrice) : undefined;
  const maxPrice =
    typeof query.maxPrice === "string" ? Number(query.maxPrice) : undefined;
  const sort =
    typeof query.sort === "string"
      ? (query.sort as "latest" | "price_asc" | "price_desc" | "featured")
      : "latest";
  const page = typeof query.page === "string" ? Number(query.page) : 1;
  const q = typeof query.q === "string" ? query.q : "";

  const categories = await getCategories();
  const result = await getProducts({
    search: q,
    category: slug,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    sort,
    page,
    pageSize: 12,
  });

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
    const basePath = `/category/${slug}`;
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  return (
    <div className="container-wrap py-8">
      <SectionHeading
        title={category.name}
        subtitle={category.description ?? "Browse category products"}
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ProductFilters categories={categories} hideCategory variant="sidebar" />
        </aside>

        <div className="space-y-4">
          <div className="surface flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {result.total} products in {category.name}
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
            pathname={`/category/${slug}`}
            searchParams={urlSearchParams}
          />
        </div>
      </div>
    </div>
  );
}
