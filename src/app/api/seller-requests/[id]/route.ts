import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAdmin } from "@/lib/api-auth";

const updateSellerRequestSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  review_note: z.string().max(500, "Review note is too long.").optional().or(z.literal("")),
});

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiAdmin();
  if (auth.error || !auth.supabase || !auth.user) {
    return auth.error;
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSellerRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const current = await auth.supabase
    .from("seller_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (current.error || !current.data) {
    return NextResponse.json({ error: "Seller request not found." }, { status: 404 });
  }

  const nextStatus = parsed.data.status;
  const reviewNote = parsed.data.review_note?.trim() || null;

  const { error: updateError } = await auth.supabase
    .from("seller_requests")
    .update({
      status: nextStatus,
      review_note: reviewNote,
      reviewed_by: auth.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (nextStatus === "approved") {
    const { error: roleError } = await auth.supabase
      .from("users")
      .update({ role: "seller" })
      .eq("id", current.data.user_id);

    if (roleError) {
      return NextResponse.json(
        { error: `Request updated but role update failed: ${roleError.message}` },
        { status: 500 },
      );
    }

    const { error: sellerProfileError } = await auth.supabase
      .from("seller_profiles")
      .upsert({
        user_id: current.data.user_id,
        store_name: current.data.store_name,
        store_description: current.data.store_description,
      });

    if (sellerProfileError) {
      return NextResponse.json(
        {
          error: `Seller approved, but seller profile upsert failed: ${sellerProfileError.message}`,
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ success: true });
}
