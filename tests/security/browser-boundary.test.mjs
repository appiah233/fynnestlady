import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "../..");
const sourceRoot = join(root, "src");

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.[cm]?[jt]sx?$/.test(entry.name) ? [path] : [];
  });
}

test("client modules cannot reference server secrets or server-only imports", () => {
  const clientFiles = sourceFiles(sourceRoot).filter((path) =>
    /^\s*["']use client["'];?/m.test(readFileSync(path, "utf8")),
  );
  assert.ok(clientFiles.length > 0, "expected at least one client module to exercise the boundary");

  for (const path of clientFiles) {
    const source = readFileSync(path, "utf8");
    const label = relative(root, path);
    const environmentReads = [...source.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g)].map((match) => match[1]);
    assert.deepEqual(
      environmentReads.filter((name) => !name.startsWith("NEXT_PUBLIC_")),
      [],
      `${label} references a private environment variable`,
    );
    assert.doesNotMatch(source, /(?:from\s*["']|import\s*["'])server-only["']/, `${label} imports server-only`);
    assert.doesNotMatch(source, /["']@\/lib\/supabase\/server["']/, `${label} imports the server Supabase client`);
    assert.doesNotMatch(
      source,
      /SUPABASE_SERVICE_ROLE_KEY|PAYSTACK_SECRET_KEY|DATABASE_URL|CLERK_SECRET_KEY/,
      `${label} names a private secret`,
    );
  }
});
