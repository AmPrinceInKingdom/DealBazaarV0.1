import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProductReview } from "@/types/domain";

const REVIEW_IMAGE_BUCKET = "review-images";

function toAbsoluteReviewImageUrl(value?: string | null) {
  const input = value?.trim();
  if (!input) {
    return null;
  }

  if (input.startsWith("http://") || input.startsWith("https://")) {
    return input;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  if (!supabaseUrl) {
    return input;
  }

  const normalizedPath = input
    .replace(new RegExp(`^${REVIEW_IMAGE_BUCKET}/`), "")
    .replace(/^\/+/, "");

  return `${supabaseUrl}/storage/v1/object/public/${REVIEW_IMAGE_BUCKET}/${normalizedPath}`;
}

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, product_id, user_id, rating, comment, image_url, created_at, user:users(full_name, avatar_url)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as ProductReview[]).map((review) => ({
    ...review,
    image_url: toAbsoluteReviewImageUrl(review.image_url),
  }));
}
