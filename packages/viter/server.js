import {createServer} from "vite"
import express from "express"
import solidPlugin from "vite-plugin-solid";
import * as path from "path";
import {createComponent} from "solid-js";
import {renderToStringAsync} from "solid-js/web";

/** @type {IFullPost[]}*/
const mockPosts = [
    {
        title: "first posst",
        description: "description",
        id: "first-post",
        html: "<h1>HEADER</h1>"
    },
    {
        title: "garbonzo is winonzo",
        description: "great!!l",
        id: "grabonzo-great",
        html: "<h2>SHIDD</h2>"
    }
]

async function createDevServer() {

    const app = express()
    const vite = await createServer({
        plugins: [
            solidPlugin({ssr: true})
        ],
        server: {
            middlewareMode: true,
        },
        root: path.join(path.dirname(""), "../core/app/src"),
        appType: "custom"

    })


    app.use(vite.middlewares)

    app.get(["/", "/index.props.json"], async (req, res) => {

        const IndexProps = {
            props: mockPosts,
            url: req.originalUrl
        }

        if (req.originalUrl == "/index.props.json") {
            return res.json(IndexProps)
        }

        const s = path.join(process.cwd(), "../core/app/src/Document.tsx")
        const module = await vite.ssrLoadModule(s)

        let html = await renderToStringAsync(() => createComponent(module.default, IndexProps))

        html = await vite.transformIndexHtml(req.originalUrl, html)
        res.send(html)
    })
    app.get("/post/:id", async (request, res) => {
        if (request.params == null || !request.params.id)
            return res.status(404)

        const IsPropsNavigate = request.params.id.endsWith(".props.json")
        if (IsPropsNavigate)
            request.params.id = request.params.id.slice(0, request.params.id.length - ".props.json".length)

        const ID = request.params.id
        if (ID.length < 1) return res.status(400)

        const post = mockPosts.find(where => where.id == ID)

        if (!post) return res.status(404)

        const PostProps = {
            url: request.originalUrl,
            props: post
        }

        if (IsPropsNavigate) {
            return res.json(PostProps)
        }

        const s = path.join(process.cwd(), "../core/app/src/Document.tsx")
        const module = await vite.ssrLoadModule(s)

        let html = await renderToStringAsync(() => createComponent(module.default, PostProps))

        html = await vite.transformIndexHtml(request.originalUrl, html)
        return res.send(html)
    })
    app.get("/add", async (req, res) => {
        const s = path.join(process.cwd(), "../core/app/src/Document.tsx")
        const module = await vite.ssrLoadModule(s)

        const AddProps = {
            props: {},
            url: req.originalUrl
        }

        let html = await renderToStringAsync(() => createComponent(module.default, AddProps))

        html = await vite.transformIndexHtml(req.originalUrl, html)
        res.send(html)
    })

    await app.listen(3000, () => console.log(`Listening on http://localhost:3000/`))
}

createDevServer()