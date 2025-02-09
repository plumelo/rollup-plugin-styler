const { resolve } = require("path");
module.exports = {
  root: true,
  extends: [
    resolve(__dirname, "..", "src", ".eslintrc.cjs"),
    "plugin:jest/recommended",
    "plugin:jest/style",
  ],
};
