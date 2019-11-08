//https://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  extends: [
    "@wmfe/eslint-config-mt/eslintrc.react.js",
    "@wmfe/eslint-config-mt/eslintrc.typescript-react.js"
  ],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",
    "react/sort-comp": "off",
    "no-use-before-define": "off",
    "consistent-return": "off",
    "no-plusplus": "off",
    "no-cond-assign": "off",
    "@typescript-eslint/restrict-plus-operands": "off",
    "no-nested-ternary": "off",
    "react/no-unused-prop-types": "off",
    "react/require-default-props": "off",
    "react/no-access-state-in-setstate": "off"
  }
};
