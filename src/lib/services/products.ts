import { cache } from "react";
import { mockProducts } from "@/lib/data";
import { getCategories } from "@/lib/services/categories";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product } from "@/types/domain";

export type ProductQueryParams = {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "latest" | "price_asc" | "price_desc" | "featured";
  page?: number;
  pageSize?: number;
};

export type ProductResult = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const DEFAULT_PAGE_SIZE = 9;
const PRODUCT_IMAGE_BUCKET = "product-images";
const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?auto=format&fit=crop&w=1200&q=80";

function toAbsoluteProductImageUrl(value?: string | null) {
  const input = value?.trim();

  if (!input) {
    return FALLBACK_PRODUCT_IMAGE;
  }

  if (input.startsWith("http://") || input.startsWith("https://")) {
    return input;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  if (!supabaseUrl) {
    return input;
  }

  let path = input;

  const publicPathMarker = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
  const publicIndex = input.indexOf(publicPathMarker);
  if (publicIndex >= 0) {
    path = input.slice(publicIndex + publicPathMarker.length);
  } else {
    path = input.replace(new RegExp(`^${PRODUCT_IMAGE_BUCKET}/`), "");
  }

  const normalizedPath = path.replace(/^\/+/, "");
  return `${supabaseUrl}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/${normalizedPath}`;
}

function normalizeProductMedia(product: Product): Product {
  const mainImage = toAbsoluteProductImageUrl(product.main_image);
  const gallery = Array.isArray(product.gallery_images)
    ? product.gallery_images.map((image) => toAbsoluteProductImageUrl(image))
    : [];

  const mergedGallery = [...new Set([mainImage, ...gallery])].slice(0, 5);

  return {
    ...product,
    main_image: mainImage,
    gallery_images: mergedGallery.length > 0 ? mergedGallery : [mainImage],
  };
}

const sortProducts = (
  items: Product[],
  sort: ProductQueryParams["sort"] = "latest",
) => {
  switch (sort) {
    case "price_asc":
      return [...items].sort((a, b) => a.price - b.price);
    case "price_desc":
      return [...items].sort((a, b) => b.price - a.price);
    case "featured":
      return [...items].sort((a, b) => Number(b.featured) - Number(a.featured));
    case "latest":
    default:
      return [...items].sort((a, b) => b.id.localeCompare(a.id));
  }
};

function filterProducts(
  products: Product[],
  params: ProductQueryParams,
): Product[] {
  const searchTerm = params.search?.trim().toLowerCase();
  let filtered = [...products];

  if (searchTerm) {
    filtered = filtered.filter((product) => {
      const categoryName = product.category?.name ?? "";
      return (
        product.name.toLowerCase().includes(searchTerm) ||
        product.short_description.toLowerCase().includes(searchTerm) ||
        product.full_description.toLowerCase().includes(searchTerm) ||
        categoryName.toLowerCase().includes(searchTerm)
      );
    });
  }

  if (params.category) {
    filtered = filtered.filter((product) => {
      return (
        product.category_id === params.category ||
        product.category?.slug === params.category
      );
    });
  }

  if (typeof params.minPrice === "number") {
    filtered = filtered.filter((product) => product.price >= params.minPrice!);
  }

  if (typeof params.maxPrice === "number") {
    filtered = filtered.filter((product) => product.price <= params.maxPrice!);
  }

  return sortProducts(filtered, params.sort);
}

export const getAllProducts = cache(async (): Promise<Product[]> => {
  const categories = await getCategories();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return mockProducts.map((product) => ({
      ...normalizeProductMedia(product),
      category: categories.find((category) => category.id === product.category_id),
    }));
  }

  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  if (!data?.length) {
    return [];
  }

  return (data as Product[]).map((product) => normalizeProductMedia(product));
});

export async function getProducts(
  params: ProductQueryParams = {},
): Promise<ProductResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE);
  const products = await getAllProducts();
  const filtered = filterProducts(products, params);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const offset = (page - 1) * pageSize;
  const items = filtered.slice(offset, offset + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getProductBySlug(slug: string) {
  const products = await getAllProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getProductById(id: string) {
  const products = await getAllProducts();
  return products.find((product) => product.id === id) ?? null;
}

export async function getFeaturedProducts(limit = 8) {
  const products = await getAllProducts();
  return products.filter((product) => product.featured).slice(0, limit);
}

export async function getTrendingProducts(limit = 8) {
  const products = await getAllProducts();
  return [...products]
    .sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0))
    .slice(0, limit);
}

export async function getFlashDealProducts(limit = 6) {
  const products = await getAllProducts();
  return [...products]
    .filter((product) => (product.discount ?? 0) >= 20)
    .slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const products = await getAllProducts();

  return products
    .filter((item) => {
      if (product.related_product_ids?.includes(item.id)) {
        return true;
      }

      return item.category_id === product.category_id && item.id !== product.id;
    })
    .filter((item) => item.id !== product.id)
    .slice(0, limit);
}
