import { NextResponse } from "next/server";
import { requireApiSellerOrAdmin } from "@/lib/api-auth";
import { productSchema } from "@/lib/validations/product";

type Context = {
  params: Promise<{ id: string }>;
};

function resolveStockStatus(stockQuantity: number) {
  if (stockQuantity <= 0) return "out_of_stock";
  if (stockQuantity < 10) return "low_stock";
  return "in_stock";
}

export async function PATCH(request: Request, context: Context) {
  const auth = await requireApiSellerOrAdmin();
  if (auth.error || !auth.supabase || !auth.user) {
    return auth.error;
  }

  const { id } = await context.params;
  const { data: existingProduct, error: existingError } = await auth.supabase
    .from("products")
    .select("id, seller_id")
    .eq("id", id)
    .single();

  if (existingError || !existingProduct) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  if (
    auth.profile?.role === "seller" &&
    existingProduct.seller_id !== auth.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid product data." },
      { status: 400 },
    );
  }

  const values = parsed.data;
  const discount =
    values.old_price && values.old_price > values.price
      ? Math.round(((values.old_price - values.price) / values.old_price) * 100)
      : 0;

  const { data, error } = await auth.supabase
    .from("products")
    .update({
      ...values,
      seller_id:
        auth.profile?.role === "seller"
          ? auth.user.id
          : values.seller_id ?? existingProduct.seller_id,
      discount,
      stock_status: resolveStockStatus(values.stock_quantity),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data });
}

export async function DELETE(_: Request, context: Context) {
  const auth = await requireApiSellerOrAdmin();
  if (auth.error || !auth.supabase || !auth.user) {
    return auth.error;
  }

  const { id } = await context.params;

  if (auth.profile?.role === "seller") {
    const { data: product } = await auth.supabase
      .from("products")
      .select("seller_id")
      .eq("id", id)
      .single();
    if (!product || product.seller_id !== auth.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const { error } = await auth.supabase.from("products").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
