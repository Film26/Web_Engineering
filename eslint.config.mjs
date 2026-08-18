import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legacy static-site files, not yet ported into the Next.js app (see
    // src/app). Kept as reference during migration; excluded from linting
    // since they intentionally still use pre-framework patterns.
    "*.html",
    "app.js",
    "admin-data.js",
  ]),
]);

export default eslintConfig;
