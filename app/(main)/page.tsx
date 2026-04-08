import { CategoryGrid } from "@/components/home/category-grid";
import { HeroSlider } from "@/components/home/hero-slider";
import { Newsletter } from "@/components/home/newsletter";
import { ProductSection } from "@/components/home/product-section";
import { PromoBanners } from "@/components/home/promo-banners";
import { TrustBadges } from "@/components/home/trust-badges";
import { getCategories } from "@/lib/services/categories";
import { translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/server-locale";
import {
  getFeaturedProducts,
  getFlashDealProducts,
  getTrendingProducts,
} from "@/lib/services/products";

export default async function HomePage() {
  const locale = await getRequestLocale();
  const [categories, featured, trending, flashDeals] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getTrendingProducts(),
    getFlashDealProducts(),
  ]);

  return (
    <div className="container-wrap py-8 sm:py-10">
      <HeroSlider />
      <CategoryGrid categories={categories} />
      <ProductSection
        title={translate("home.featured.title", locale)}
        subtitle={translate("home.featured.subtitle", locale)}
        products={featured}
        href="/products?sort=featured"
        actionLabel={translate("common.viewAll", locale)}
      />
      <ProductSection
        title={translate("home.trending.title", locale)}
        subtitle={translate("home.trending.subtitle", locale)}
        products={trending}
        variant="marquee"
        actionLabel={translate("common.viewAll", locale)}
      />
      <ProductSection
        title={translate("home.flash.title", locale)}
        subtitle={translate("home.flash.subtitle", locale)}
        products={flashDeals}
        variant="marquee"
        actionLabel={translate("common.viewAll", locale)}
      />
      <PromoBanners />
      <TrustBadges />
      <Newsletter />
    </div>
  );
}
