import perfectionist from "eslint-plugin-perfectionist";
import perfectionistRules from "./perfectionistRules.config.js";

export default {
  files: ["scripts/**/*.mjs"],
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: {
    perfectionist,
  },
  rules: {
    ...perfectionistRules,
    "no-underscore-dangle": [
      "error",
      {
        allowAfterThis: true,
        enforceInClassFields: false,
        enforceInMethodNames: false,
      },
    ],
    "import/no-extraneous-dependencies": ["off", { devDependencies: true }],
    "import/prefer-default-export": "off",
  },
};
