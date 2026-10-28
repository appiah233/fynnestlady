import "server-only";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { publicSupabaseConfig } from "@/lib/env";

export async function createSupabaseServerClient() {
  const { url, publishableKey } = publicSupabaseConfig();
  const clerk = await auth();
  return createClient(url, publishableKey, {
    accessToken: () => clerk.getToken(),
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
