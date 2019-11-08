"use strict";

module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: "> 0.25%, not dead"
      }
    ],
    "@babel/preset-react",
    "@babel/preset-typescript"
  ],
  plugins: [
    "@babel/plugin-transform-runtime",
    "@babel/plugin-transform-typescript",
    "@babel/plugin-proposal-class-properties"
  ],
  env: {
    test: {
      plugins: ["espower"]
    }
  }
};
