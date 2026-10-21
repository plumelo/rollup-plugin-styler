import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import-x";
import jest from "eslint-plugin-jest";
import unicorn from "eslint-plugin-unicorn";
import prettier from "eslint-config-prettier/flat";
import globals from "globals";

export default tseslint.config(
  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      "dist/**",
      "tmp/**",
      ".cache/**",
      "coverage/**",
      "docs/**",
      "__tests__/fixtures/**",
      "eslint.config.*",
      "babel.config.js",
      "runtime/**",
    ],
  },

  // ESLint recommended
  js.configs.recommended,

  // TypeScript: parser + plugin rules (recommended, no type-aware rules)
  ...tseslint.configs.recommended,

  // Language options (replaces env + parserOptions)
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
  },

  // Type-aware rules for src and tests: replaces the old nested
  // src/.eslintrc.cjs + __tests__/.eslintrc.cjs (root: true + project),
  // keeping the same explicitly enabled rules
  {
    files: ["src/**/*.ts", "__tests__/**/*.ts"],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/default-param-last": "error",
      "@typescript-eslint/naming-convention": "error",
      "@typescript-eslint/prefer-for-of": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/prefer-reduce-type-parameter": "error",
      "@typescript-eslint/prefer-ts-expect-error": "error",
      "@typescript-eslint/promise-function-async": "error",
      "@typescript-eslint/return-await": "error",
      "@typescript-eslint/unified-signatures": "error",
      // new in v8: for await...of over sync iterables is the established
      // idiom here, keeping sequential awaits out of no-await-in-loop's reach
      "@typescript-eslint/await-thenable": "off",
    },
  },

  // import plugin
  importPlugin.flatConfigs.recommended,
  {
    settings: {
      "import-x/resolver": {
        node: { extensions: [".mjs", ".js", ".cjs", ".json", ".ts"] },
      },
      // analyze .ts imports with the TS parser so named exports are checked
      "import-x/parsers": { "@typescript-eslint/parser": [".ts", ".tsx"] },
    },
  },

  // unicorn recommended
  {
    ...unicorn.configs.recommended,
    files: ["**/*.{js,ts,mjs,cjs}"],
  },

  // jest plugin (scoped to test files)
  {
    files: ["__tests__/**/*.{ts,js}"],
    ...jest.configs["flat/recommended"],
    ...jest.configs["flat/style"],
  },

  // Custom rules
  {
    rules: {
      "no-await-in-loop": "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-template": "error",
      "sort-vars": "error",
      // Preserve old behavior: allow unused catch arguments
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { caughtErrors: "none" }],
      yoda: ["error", "never", { exceptRange: true }],

      // unicorn overrides
      // renamed: prefer-json-parse-buffer -> consistent-json-file-read, prevent-abbreviations -> name-replacements
      "unicorn/no-null": "off",
      "unicorn/consistent-json-file-read": "off",
      "unicorn/prefer-module": "off",
      "unicorn/prefer-node-protocol": "off",
      "unicorn/prefer-set-has": "off",
      "unicorn/name-replacements": "off",
      // new v72 rules that are too noisy for this project
      "unicorn/filename-case": "off",
      "unicorn/no-anonymous-default-export": "off",
      "unicorn/no-array-sort": "off",
      "unicorn/no-unreadable-for-of-expression": "off",
      "unicorn/no-this-outside-of-class": "off",
      "unicorn/no-unsafe-string-replacement": "off",
      "unicorn/no-break-in-nested-loop": "off",
      "unicorn/no-return-array-push": "off",
      "unicorn/prefer-await": "off",
      "unicorn/max-nested-calls": "off",
      "unicorn/import-style": "off",
      "unicorn/require-array-sort-compare": "off",
      "unicorn/no-computed-property-existence-check": "off",
      "unicorn/consistent-boolean-name": "off",
      "unicorn/no-top-level-assignment-in-function": "off",
      "unicorn/prefer-simple-condition-first": "off",
      "unicorn/no-declarations-before-early-exit": "off",
      "unicorn/no-array-reverse": "off",
      "unicorn/prefer-code-point": "off",
      // v78: asterisk-less JSDoc rewrite churns the whole tree and fights
      // the house /** x */ doc-comment style
      "unicorn/no-asterisk-prefix-in-documentation-comments": "off",
      "unicorn/single-line-block-comment-style": "off",
      // v78: rewrites if/return tails into ternaries; house style is if/return
      "unicorn/prefer-ternary": "off",

      // TS: allow createRequire (used for CJS interop)
      "@typescript-eslint/no-require-imports": "off",
      // TS: allow empty interfaces (used for type extension pattern)
      "@typescript-eslint/no-empty-object-type": "off",
      // TS: allow expression statements (used in test helpers)
      "@typescript-eslint/no-unused-expressions": "off",

      // import-x reads runtime exports; named imports that are TS types
      // (postcss, rollup, ...) are not runtime exports and false-positive
      "import-x/named": "off",
    },
  },

  // prettier must be last
  prettier,
);
