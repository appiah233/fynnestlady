"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicSupabaseConfig } from "@/lib/env";

export function createSupabaseBrowserClient() {
  const { url, publishableKey } = publicSupabaseConfig();
  return createBrowserClient(url, publishableKey);
}
