import nodeResolve from "@rollup/plugin-node-resolve";
import common from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import terser from "rollup-plugin-terser";
import jsonPlugin from "@rollup/plugin-json"
import postcss from "rollup-plugin-postcss"
import path from "path";

const extensions = [".js", ".jsx", ".es6", ".es", ".mjs", ".ts", ".tsx"];

const IsProd = process.env.NODE_ENV === 'PROD'

/** @type {import('rollup').RollupOptions} */
const Config = {
    input: "src/index.tsx",
    output: [
        {
            // entryFileNames: "worker.[hash].js",
            dir: ".worker",
            format: "esm",
            manualChunks: false,
            esModule: true,
        },
    ],
    preserveEntrySignatures: false,
    external: IsProd ? [] : ["solid-js", "solid-js/web", "path", "express"],
    plugins: [
        postcss({
            extract: false,
            modules: true,
            minimize: false,
            inject: false
        }),
        jsonPlugin(),
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
                ["solid", {generate: "ssr", hydratable: true}],
            ],
        }),
        common({extensions}),
        IsProd && terser.terser()
    ],
}

export default Config