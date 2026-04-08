import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/lib/services/categories";

export default async function SellerNewProductPage() {
  const categories = await getCategories();
  return <ProductForm categories={categories} mode="seller" />;
}
