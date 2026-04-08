import { NextResponse } from "next/server";
import { productReviewSchema } from "@/lib/validations/review";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireApiUser } from "@/lib/api-auth";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Context) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ reviews: [] });
  }

  const { id } = await context.params;

  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, product_id, user_id, rating, comment, image_url, created_at, user:users(full_name, avatar_url)")
    .eq("product_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reviews: data ?? [] });
}

export async function POST(request: Request, context: Context) {
  const auth = await requireApiUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return auth.error;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = productReviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid review data." },
      { status: 400 },
    );
  }

  const { data: productExists, error: productCheckError } = await auth.supabase
    .from("products")
    .select("id")
    .eq("id", id)
    .single();

  if (productCheckError || !productExists) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const insertResult = await auth.supabase
    .from("product_reviews")
    .insert({
      product_id: id,
      user_id: auth.user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      image_url: parsed.data.image_url ?? null,
    })
    .select("id")
    .single();

  if (insertResult.error || !insertResult.data) {
    return NextResponse.json(
      { error: insertResult.error?.message ?? "Unable to submit review." },
      { status: 500 },
    );
  }

  const reviewResult = await auth.supabase
    .from("product_reviews")
    .select("id, product_id, user_id, rating, comment, image_url, created_at, user:users(full_name, avatar_url)")
    .eq("id", insertResult.data.id)
    .single();

  if (reviewResult.error || !reviewResult.data) {
    return NextResponse.json(
      { error: reviewResult.error?.message ?? "Review saved but failed to load." },
      { status: 500 },
    );
  }

  return NextResponse.json({ review: reviewResult.data }, { status: 201 });
}
