import common from "@rollup/plugin-commonjs";
import {nodeResolve} from "@rollup/plugin-node-resolve";
import {babel} from "@rollup/plugin-babel";
import {terser} from "rollup-plugin-terser";
import jsonPlugin from "@rollup/plugin-json"
import path from "path";

const extensions = [".js", ".jsx", ".es6", ".es", ".mjs", ".ts", ".tsx"];

const IsProd = process.env.NODE_ENV === 'PROD'

/** @type {import('rollup').RollupOptions} */
const Config = {
    input: "index.js",
    output: [
        {
            dir: "dist",
            format: "commonjs",
        },
    ],
    preserveEntrySignatures: false,
    // external: ["solid-js", "solid-js/web", "path", "express", "vite", "rollup", "vitefu"],
    plugins: [
        jsonPlugin(),
        // nodeResolve({
        //     preferBuiltins: true,
        //     extensions,
        //     exportConditions: ["solid", "node"],
        // }),
        babel({
            babelHelpers: "bundled",
            extensions,
            presets: [
                "@babel/preset-typescript",
                // ["solid", {generate: "ssr", hydratable: true}],
            ],
        }),
        common({extensions}),
        // IsProd && terser.terser()
    ],
}

export default Config