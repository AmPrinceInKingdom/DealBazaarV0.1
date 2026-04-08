import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireApiUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      error: NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 500 },
      ),
      supabase: null,
      user: null,
      profile: null,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      supabase,
      user: null,
      profile: null,
    };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    error: null,
    supabase,
    user,
    profile,
  };
}

export async function requireApiAdmin() {
  const result = await requireApiUser();
  if (result.error) {
    return result;
  }

  if (result.profile?.role !== "admin" && result.profile?.role !== "super_admin") {
    return {
      ...result,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return result;
}

export async function requireApiSellerOrAdmin() {
  const result = await requireApiUser();
  if (result.error) {
    return result;
  }

  if (
    result.profile?.role !== "seller" &&
    result.profile?.role !== "admin" &&
    result.profile?.role !== "super_admin"
  ) {
    return {
      ...result,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return result;
}

export async function requireApiSuperAdmin() {
  const result = await requireApiUser();
  if (result.error) {
    return result;
  }

  if (result.profile?.role !== "super_admin") {
    return {
      ...result,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return result;
}
