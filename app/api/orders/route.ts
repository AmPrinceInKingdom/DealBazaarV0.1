import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.error || !auth.user || !auth.supabase) {
    return auth.error;
  }

  const { data, error } = await auth.supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data });
}
