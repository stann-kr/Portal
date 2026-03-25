import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  {
    extends: ["next/core-web-vitals", "next/typescript"],
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
