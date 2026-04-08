import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api-auth";

const sellerRequestSchema = z.object({
  store_name: z.string().min(2, "Store name is required."),
  store_description: z.string().min(10, "Store description is too short."),
  reason: z.string().max(500, "Reason is too long.").optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return auth.error;
  }

  if (
    auth.profile?.role === "seller" ||
    auth.profile?.role === "admin" ||
    auth.profile?.role === "super_admin"
  ) {
    return NextResponse.json(
      { error: "Your account already has seller privileges." },
      { status: 400 },
    );
  }

  const body = await request.json();
  const parsed = sellerRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request data." },
      { status: 400 },
    );
  }

  const existing = await auth.supabase
    .from("seller_requests")
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("status", "pending")
    .limit(1);

  if ((existing.data?.length ?? 0) > 0) {
    return NextResponse.json(
      { error: "You already have a pending seller request." },
      { status: 400 },
    );
  }

  const { error } = await auth.supabase.from("seller_requests").insert({
    user_id: auth.user.id,
    store_name: parsed.data.store_name.trim(),
    store_description: parsed.data.store_description.trim(),
    reason: parsed.data.reason?.trim() || null,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
