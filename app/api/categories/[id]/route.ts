import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/api-auth";

type Context = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_: Request, context: Context) {
  const auth = await requireApiAdmin();
  if (auth.error || !auth.supabase) {
    return auth.error;
  }

  const { id } = await context.params;
  const { error } = await auth.supabase.from("categories").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
