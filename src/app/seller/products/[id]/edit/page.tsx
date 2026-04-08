import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getAuthContext } from "@/lib/auth";
import { getCategories } from "@/lib/services/categories";
import { getProductById } from "@/lib/services/products";

type SellerEditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SellerEditProductPage({
  params,
}: SellerEditProductPageProps) {
  const { id } = await params;
  const auth = await getAuthContext();
  const [categories, product] = await Promise.all([
    getCategories(),
    getProductById(id),
  ]);

  if (!product) {
    notFound();
  }

  if (auth?.profile?.role === "seller" && product.seller_id !== auth.user.id) {
    notFound();
  }

  return <ProductForm categories={categories} product={product} mode="seller" />;
}
