import parser from "@typescript-eslint/parser";
import perfectionist from "eslint-plugin-perfectionist";
import perfectionistRules from "./perfectionistRules.config.js";

export default {
  files: ["**/*.ts", "**/*.tsx", "**/*.test.ts"],
  languageOptions: {
    ecmaVersion: "latest",
    parser,
    parserOptions: {
      jsDocParsingMode: "type-info",
      project: ["../tsconfig.json", "../tsconfig.test.json"],
    },
    sourceType: "module",
  },
  plugins: {
    perfectionist,
  },
  rules: {
    "@typescript-eslint/no-shadow": ["error"],
    "no-shadow": "off",
    "no-underscore-dangle": [2, { allowAfterThis: true }],
    "no-use-before-define": [
      "error",
      { classes: false, functions: true, variables: true },
    ],
    ...perfectionistRules,
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: ["../tsconfig.json", "../tsconfig.test.json"],
      },
    },
  },
};
