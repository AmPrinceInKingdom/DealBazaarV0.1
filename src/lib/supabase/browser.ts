"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  if (!supabaseClient) {
    const { url, anonKey } = getSupabaseEnv();
    supabaseClient = createBrowserClient(url, anonKey);
  }

  return supabaseClient;
}
