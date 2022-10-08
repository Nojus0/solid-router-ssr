import nodeResolve from "@rollup/plugin-node-resolve";
import common from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import terser from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";
const extensions = [".js", ".jsx", ".es6", ".es", ".mjs", ".ts", ".tsx"];

export default [
  {
    input: "server/index.tsx",
    output: [
      {
        dir: "build/server",
        format: "cjs",
      },
    ],
    preserveEntrySignatures: false,
    external: ["solid-js", "solid-js/web", "path", "express"],
    plugins: [
      nodeResolve({
        preferBuiltins: true,
        extensions,
        exportConditions: ["solid", "node"],
      }),
      babel({
        babelHelpers: "bundled",
        extensions,
        presets: [
          "@babel/preset-typescript",
          ["solid", { generate: "ssr", hydratable: true }],
        ],
      }),
      common({ extensions }),
    ],
  },
  {
    input: "app/index.tsx",
    output: [
      {
        dir: "build/app/js",
        format: "esm",
      },
    ],
    preserveEntrySignatures: false,
    plugins: [
      nodeResolve({
        exportConditions: ["solid"],
        extensions,
      }),
      babel({
        babelHelpers: "bundled",
        extensions,
        presets: [
          "@babel/preset-typescript",
          ["solid", { generate: "dom", hydratable: true }],
        ],
      }),
      common({ extensions }),
      copy({
        targets: [
          {
            src: ["app/public/*"],
            dest: "build/app",
          },
        ],
      }),
      // terser.terser(),
    ],
  },
];
