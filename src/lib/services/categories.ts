import { cache } from "react";
import { mockCategories } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Category } from "@/types/domain";

export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return mockCategories;
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return [];
  }

  if (!data?.length) {
    return [];
  }

  return data;
});

export async function getCategoryBySlug(slug: string) {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}
