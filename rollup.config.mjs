import { readdirSync } from "fs";

import terser from "@rollup/plugin-terser";
import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
// eslint-disable-next-line import/no-unresolved
import externals from "rollup-plugin-node-externals";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { URL } from "url";
import pkg from "./package.json" with { type: "json" };

const extensions = [".ts", ".mjs", ".js", ".cjs", ".json"];
const __dirname = new URL(".", import.meta.url).pathname;

/** @type {import('rollup').RollupOptions[]} */
const config = [
  // Bundle
  {
    input: "./src/index.ts",
    output: [
      { format: "cjs", file: pkg.exports.require, exports: "default" },
      { format: "es", file: pkg.exports.import, exports: "default" },
    ],
    plugins: [
      externals({ deps: true, devDeps: true }),
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      }),
      json(),
      resolve({ preferBuiltins: true, extensions }),
      commonjs(),
      typescript(),
      babel({ babelHelpers: "bundled", extensions }),
    ],
  },
  // Injector
  {
    input: "./runtime/inject-css.js",
    output: { format: "es", file: "./dist/runtime/inject-css.js" },
    plugins: [
      externals({ deps: true }),
      json(),
      resolve({ preferBuiltins: true }),
      commonjs(),
      babel({
        babelHelpers: "bundled",
        configFile: false,
        presets: [["@babel/preset-env", { modules: false, targets: { ie: "8" } }]],
      }),
      terser({ format: { comments: false }, ie8: true, safari10: true }),
    ],
  },
  // Declaration
  {
    input: "./src/index.ts",
    output: { format: "es", file: pkg.types },
    plugins: [
      externals({ deps: true }),
      dts({ respectExternal: true }),
      {
        name: "shims",
        banner: readdirSync(`${__dirname}/src/shims`)
          .map(s => s.replace(/\.ts$/, "").replace(/\.d$/, ""))
          .map(s => `/// <reference types="./shims/${s}" />`)
          .join("\n"),
      },
    ],
  },
];

export default config;
