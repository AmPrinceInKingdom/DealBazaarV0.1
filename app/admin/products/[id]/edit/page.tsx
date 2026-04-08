import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/lib/services/categories";
import { getProductById } from "@/lib/services/products";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [categories, product] = await Promise.all([
    getCategories(),
    getProductById(id),
  ]);

  if (!product) {
    notFound();
  }

  return <ProductForm categories={categories} product={product} />;
}
