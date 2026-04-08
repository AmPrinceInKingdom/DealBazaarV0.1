import { createClient } from "@supabase/supabase-js";
import {
  getServiceRoleKey,
  getSupabaseEnv,
  hasSupabaseEnv,
} from "@/lib/supabase/env";

export function createSupabaseAdminClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const { url } = getSupabaseEnv();
  const serviceRoleKey = getServiceRoleKey();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
