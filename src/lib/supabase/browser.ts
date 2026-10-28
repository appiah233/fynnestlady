"use client";

import { createClient } from "@supabase/supabase-js";
import { publicSupabaseConfig } from "@/lib/env";

/** Pass Clerk's session.getToken callback from a component using useSession(). */
export function createSupabaseBrowserClient(getToken: () => Promise<string | null>) {
  const { url, publishableKey } = publicSupabaseConfig();
  return createClient(url, publishableKey, {
    accessToken: getToken,
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
