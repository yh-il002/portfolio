/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
    semi: true,
    singleQuote: true,
    trailingComma: 'es5',
    jsxBracketSameLine: false,
    htmlWhitespaceSensitivity: 'strict',
    vueIndentScriptAndStyle: false,
    printWidth: 80,
    'max-len': 'off',
};

export default config;
