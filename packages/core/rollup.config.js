import nodeResolve from "@rollup/plugin-node-resolve";
import common from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import terser from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";
import jsonPlugin from "@rollup/plugin-json"
import fs from "fs"
import path from "path";

const extensions = [".js", ".jsx", ".es6", ".es", ".mjs", ".ts", ".tsx"];

const IsProd = process.env.NODE_ENV === 'PROD'

try {
    fs.rmSync(path.join(__dirname, ".output"), {recursive: true})
    console.log("Removed .output")
} catch (err) {
    // console.log(err)
}

export default [
    {
        input: "server/index.tsx",

        output: [
            {
                dir: ".output/server",
                format: "cjs",
                manualChunks: false
            },
        ],
        preserveEntrySignatures: false,
        external: IsProd ? [] : ["solid-js", "solid-js/web", "path", "express"],
        plugins: [
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
    },
    {
        input: "app/index.tsx",
        output: [
            {
                dir: ".output/app/js",
                format: "esm",
                manualChunks(id) {
                    if (id.includes('node_modules') || id === path.join(__dirname, "./app/src/RouteWrapper.tsx")) {
                        return 'vendor';
                    }
                }
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
                    ["solid", {generate: "dom", hydratable: true}],
                ],
            }),
            common({extensions}),
            copy({
                targets: [
                    {
                        src: ["app/public/*"],
                        dest: ".output/app/assets",
                    },
                ],
            }),
            IsProd && terser.terser(),
        ],
    },
];
