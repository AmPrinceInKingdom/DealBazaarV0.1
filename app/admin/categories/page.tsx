import { CategoryManager } from "@/components/admin/category-manager";
import { getCategories } from "@/lib/services/categories";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  return <CategoryManager categories={categories} />;
}
