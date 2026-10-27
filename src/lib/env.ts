/** Public configuration only. This module may be imported by browser code. */
export function publicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();

  if (!url || !publishableKey) {
    throw new Error("Missing public Supabase configuration");
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid Supabase URL");
  }
  if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") {
    throw new Error("Supabase URL must use HTTPS");
  }
  return { url: parsed.toString(), publishableKey };
}

/** Returns true when public Supabase URL and publishable/anon key are present and valid. */
export function isSupabaseConfigured(): boolean {
  try {
    publicSupabaseConfig();
    return true;
  } catch {
    return false;
  }
}

/** Public Clerk configuration for Next.js App Router authentication. */
export function publicClerkConfig() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL?.trim() || "/sign-in";
  const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL?.trim() || "/sign-up";

  if (!publishableKey) {
    throw new Error("Missing public Clerk configuration");
  }
  if (!/^pk_(?:test|live)_/.test(publishableKey)) {
    throw new Error("Invalid Clerk publishable key format");
  }
  return { publishableKey, signInUrl, signUpUrl };
}

/** Returns true when a valid Clerk publishable key is present in the environment. */
export function isClerkConfigured(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  return Boolean(publishableKey && /^pk_(?:test|live)_/.test(publishableKey));
}
