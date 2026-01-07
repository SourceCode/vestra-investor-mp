import perfectionist from "eslint-plugin-perfectionist";
import perfectionistRules from "./perfectionistRules.config.js";

export default {
  files: ["**/*.mjs", "!scripts/*.mjs"],
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: {
    perfectionist,
  },
  rules: {
    ...perfectionistRules,
  },
};
