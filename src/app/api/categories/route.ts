import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAdmin } from "@/lib/api-auth";

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
});

export async function POST(request: Request) {
  const auth = await requireApiAdmin();
  if (auth.error || !auth.supabase) {
    return auth.error;
  }

  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid category data." },
      { status: 400 },
    );
  }

  const { data, error } = await auth.supabase
    .from("categories")
    .insert(parsed.data)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ category: data });
}
