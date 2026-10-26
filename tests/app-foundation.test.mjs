import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { publicSupabaseConfig } from "../src/lib/env.ts";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

afterEach(() => {
  if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
});

test("public Supabase configuration requires both public values", () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  assert.throws(publicSupabaseConfig, /Missing public Supabase configuration/);
});

test("public Supabase configuration rejects non-HTTPS remote URLs", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://example.com";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "development-public-key";
  assert.throws(publicSupabaseConfig, /must use HTTPS/);
});

test("public Supabase configuration accepts HTTPS URL and public key", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "development-public-key";
  assert.deepEqual(publicSupabaseConfig(), {
    url: "https://example.supabase.co/",
    publishableKey: "development-public-key",
  });
});
