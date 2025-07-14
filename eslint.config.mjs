import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts,vue}"]},
  {ignores: ["**/webpack/**", "webpack.config.js"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  eslintConfigPrettier,
  {
    rules: {
    "no-undef": 0,
    "no-unused-vars": 0,
    "vue/html-self-closing": ["error", {
      html: {
        void: "always",
      },
    }],
    "vue/no-side-effects-in-computed-properties": 1,
    "vue/no-v-html": 0,
    "vue/prop-name-casing": ["error", "camelCase"],
    "vue/one-component-per-file": 0,
    "@typescript-eslint/explicit-module-boundary-types": 0,
    },
  },
  {files: ["**/*.vue"], languageOptions: {parserOptions: {parser: tseslint.parser}}},
];