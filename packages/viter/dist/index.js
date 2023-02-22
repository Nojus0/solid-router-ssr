import { createServer } from "vite";
import express from "express";
import solidPlugin from "vite-plugin-solid";
import * as path from "path";
import { renderToStringAsync } from "solid-js/web";
import { createComponent } from "solid-js";
async function createDevServer() {
    const app = express();
    const vite = await createServer({
        plugins: [
            solidPlugin({ ssr: true })
        ],
        server: {
            middlewareMode: true,
        },
        root: path.join(path.dirname(""), "../core/app/src"),
        appType: "custom"
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res) => {
        const lol = {
            url: req.originalUrl,
            method: req.method,
            body: req.body,
            headers: req.headers,
        };
        const { handler } = await vite.ssrLoadModule(path.join(process.cwd(), "./handler.js"));
        const doc = await vite.ssrLoadModule(path.join(process.cwd(), "../../core/app/src/Document.tsx"));
        const render = (props) => renderToStringAsync(() => createComponent(doc.default, props));
        const resp = await handler(lol, render);
        console.log(resp);
        res.header = resp.headers || {};
        res.status(resp.status || 200).send(resp.body);
    });
    await app.listen(3000, () => console.log(`Listening on http://localhost:3000/`));
}
createDevServer();
