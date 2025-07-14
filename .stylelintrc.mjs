/** @type {import('stylelint').Config} */
export default {
  extends: [
    'stylelint-config-recommended-scss',
    'stylelint-config-standard-vue/scss',
    'stylelint-config-recess-order',
  ],
  overrides: [
    {
      files: ['*.vue', '*.html'],
      customSyntax: "postcss-html"
    },
  ],
  plugins: ['stylelint-scss'],
  rules: {
    'block-no-empty': null,
    'no-descending-specificity': null,
    'no-empty-source': null,
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep'],
      },
    ],
    'selector-class-pattern': null,
    'rule-empty-line-before': null,
    'at-rule-empty-line-before': null,
    'declaration-empty-line-before': null,
    'function-url-quotes': null,
    'scss/load-no-partial-leading-underscore': null,
    'declaration-property-value-no-unknown': null,
    'selector-type-no-unknown': null,
  },
  ignoreFiles: ['node_modules', 'dist']
};