import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductReviews } from "@/components/product/product-reviews";
import { ProductDetailActions } from "@/components/product/product-detail-actions";
import { ProductPrice } from "@/components/product/product-price";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/services/products";
import { getProductReviews } from "@/lib/services/reviews";
import { getAuthContext } from "@/lib/auth";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const [related, reviews, auth] = await Promise.all([
    getRelatedProducts(product, 4),
    getProductReviews(product.id),
    getAuthContext(),
  ]);

  return (
    <div className="container-wrap py-8">
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href="/">Home</Link> / <Link href="/products">Products</Link> /{" "}
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery
          mainImage={product.main_image}
          gallery={product.gallery_images}
          name={product.name}
        />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {product.featured ? <Badge>Featured</Badge> : null}
            {product.discount ? <Badge variant="danger">-{product.discount}%</Badge> : null}
            <Badge variant="secondary">
              {product.stock_quantity > 0 ? "In stock" : "Out of stock"}
            </Badge>
          </div>
          <h1 className="text-3xl font-black">{product.name}</h1>
          <p className="text-base text-foreground/80 break-words">
            {product.short_description}
          </p>
          <ProductPrice price={product.price} oldPrice={product.old_price} />
          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
          <ProductDetailActions product={product} />
          {product.video_url ? (
            <a
              href={product.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-sm font-semibold text-primary hover:underline"
            >
              Watch product video
            </a>
          ) : null}
        </div>
      </div>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <article className="surface p-6">
          <h2 className="text-xl font-bold">Description</h2>
          <p className="mt-3 text-base leading-7 text-foreground/80 break-words">
            {product.full_description}
          </p>
        </article>
        <article className="surface p-6">
          <h2 className="text-xl font-bold">Specifications</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex items-start justify-between gap-3">
                <dt className="font-semibold">{key}</dt>
                <dd className="text-right text-foreground/80 break-words">{value}</dd>
              </div>
            ))}
          </dl>
        </article>
      </section>

      <section className="mt-12">
        <ProductReviews
          productId={product.id}
          initialReviews={reviews}
          isAuthenticated={Boolean(auth)}
        />
      </section>

      <section className="mt-14 space-y-6">
        <SectionHeading
          title="Related products"
          subtitle="Products you might also like."
        />
        <ProductGrid products={related} />
      </section>
    </div>
  );
}
