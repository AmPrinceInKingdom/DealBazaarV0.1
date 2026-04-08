import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types/domain";

export type AuthContext = {
  user: {
    id: string;
    email: string | undefined;
  };
  profile: UserProfile | null;
};

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
  };
}

export async function requireAuth() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login");
  }
  return auth;
}

export async function requireAdmin() {
  const auth = await requireAuth();
  if (auth.profile?.role !== "admin" && auth.profile?.role !== "super_admin") {
    redirect("/");
  }
  return auth;
}

export async function requireSeller() {
  const auth = await requireAuth();
  if (auth.profile?.role !== "seller") {
    redirect("/");
  }
  return auth;
}

export async function requireSellerOrAdmin() {
  const auth = await requireAuth();
  if (
    auth.profile?.role !== "seller" &&
    auth.profile?.role !== "admin" &&
    auth.profile?.role !== "super_admin"
  ) {
    redirect("/");
  }
  return auth;
}

export async function requireSuperAdmin() {
  const auth = await requireAuth();
  if (auth.profile?.role !== "super_admin") {
    redirect("/");
  }
  return auth;
}
