import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/api-auth";
import { paymentStatusSchema } from "@/lib/validations/checkout";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  const auth = await requireApiAdmin();
  if (auth.error || !auth.supabase || !auth.user) {
    return auth.error;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = paymentStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { status } = parsed.data;

  const { error: orderError } = await auth.supabase
    .from("orders")
    .update({ payment_status: status })
    .eq("id", id);

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  const { error: paymentError } = await auth.supabase
    .from("payments")
    .update({
      status,
      verified_by: auth.user.id,
      verified_at: new Date().toISOString(),
    })
    .eq("order_id", id);

  if (paymentError) {
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
