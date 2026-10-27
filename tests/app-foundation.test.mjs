import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  isClerkConfigured,
  isSupabaseConfigured,
  publicClerkConfig,
  publicSupabaseConfig,
} from "../src/lib/env.ts";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const originalPublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const originalClerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

afterEach(() => {
  if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  if (originalPublishableKey === undefined)
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalPublishableKey;
  if (originalClerkKey === undefined)
    delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  else process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalClerkKey;
});

test("public Supabase configuration requires both public values", () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  assert.equal(isSupabaseConfigured(), false);
  assert.throws(publicSupabaseConfig, /Missing public Supabase configuration/);
});

test("public Supabase configuration rejects non-HTTPS remote URLs", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://example.com";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "development-public-key";
  assert.throws(publicSupabaseConfig, /must use HTTPS/);
});

test("public Supabase configuration accepts HTTPS URL and publishable or anon key", () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mnppyjrncgaynqaexgrz.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test_key";
  assert.equal(isSupabaseConfigured(), true);
  assert.deepEqual(publicSupabaseConfig(), {
    url: "https://mnppyjrncgaynqaexgrz.supabase.co/",
    publishableKey: "sb_publishable_test_key",
  });
});

test("public Clerk configuration validates publishable key format", () => {
  delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  assert.equal(isClerkConfigured(), false);
  assert.throws(publicClerkConfig, /Missing public Clerk configuration/);

  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "invalid-key";
  assert.equal(isClerkConfigured(), false);
  assert.throws(publicClerkConfig, /Invalid Clerk publishable key format/);

  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_example123";
  assert.equal(isClerkConfigured(), true);
  assert.deepEqual(publicClerkConfig(), {
    publishableKey: "pk_test_example123",
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
  });
});
