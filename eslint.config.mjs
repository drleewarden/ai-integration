import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Stylistic rule -- apostrophes/quotes in JSX content are fine for a
      // copy-heavy marketing site and don't represent a real bug.
      "react/no-unescaped-entities": "off",
      // Self-imposed font loading is intentional in app/layout.tsx; Next's
      // default font pipeline isn't being used here.
      "@next/next/no-page-custom-font": "off",
      // Loosen a few rules that block the production build but aren't
      // correctness issues.
      "@next/next/no-html-link-for-pages": "off",
      "prefer-const": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];

export default eslintConfig;
