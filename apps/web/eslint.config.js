import nextCoreWebVitals from "eslint-config-next/core-web-vitals.js";

export default [
  // Base rules and ignores
  {
    rules: {
      semi: "error",
      "prefer-const": "error",
    },
    ignores: [".next"],
  },

  // Next.js core web vitals (flat config exports an array and already sets up TypeScript ESLint)
  ...nextCoreWebVitals,

  // Allow anonymous default exports in config files
  {
    files: ["*.config.js", "*.config.ts"],
    rules: {
      "import/no-anonymous-default-export": "off",
    },
  },

  // Project-specific TS settings and rules
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },

  // Linter options
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
];
