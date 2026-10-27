import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const eslintConfig = [
  ...compat.config({ extends: ["next/core-web-vitals", "next/typescript"] }),
  { ignores: [".next/**", "node_modules/**", ".npm-cache/**", "coverage/**", "playwright-report/**", "test-results/**", "next-env.d.ts"] },
];

export default eslintConfig;
