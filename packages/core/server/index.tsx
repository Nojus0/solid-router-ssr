import {renderToStringAsync} from "solid-js/web";
import express from "express";
import path from "path"
import {IFullPost} from "../app/src/Pages/Post";
import Entrypoint from "../app/src/Document";
import process from "process";

const app = express();

app.use(express.static(path.join(__dirname, "../app")))

const testArticles: IFullPost[] = [
    {
        id: "something-happens",
        title: "Something happens in the babylon",
        description: "This really happened",
        html: "Awesome",
    },
    {
        id: "blah-l",
        title: "Blahg bla",
        description: "Yeah suuuuuuureeee!",
        html: "Awesome",
    },
    {
        id: "how-tomake",
        title: "How to make static go fast",
        description: "Statis or ssr?",
        html: "Awesome",
    },
    {
        id: "best-framework",
        title: "The best javascript framework is any templating engine",
        description: "It's hard to believe isn't it",
        html: `
<div>
    <h1>Header h1</h1>
    <h2>This is very real</h2>
    <p>This is <b>BOLD</b></p>
</div>
`
    }
]

app.use("/post/:id", async (req, res) => {

    const isClientNavigate = req.params.id.endsWith(".props.json")

    if (isClientNavigate)
        req.params.id = req.params.id.slice(0, req.params.id.length - ".props.json".length)

    const ID = req.params.id

    if (!ID) return res.status(404).send()
    const Post = testArticles.find(where => where.id == ID)
    if (!Post) return res.status(404).send()

    const props = {
        props: Post
    }
    if (isClientNavigate) {
        console.log(`[GET] ${req.originalUrl} Props Only`)
        return res.json(props)
    }

    console.log(`[GET] ${req.originalUrl} SSR Render`)
    const html = await renderToStringAsync(() =>
        <Entrypoint props={props} url={req.originalUrl}/>
    )
    res.status(200).send(html)
})

app.use("/add", async (req, res) => {

    const html = await renderToStringAsync(() => (
        <Entrypoint url={req.originalUrl} props={{}}/>
    ))
    res.status(200).send(html)
})

app.use("/api/_add_new", express.json({type: "application/json"}), (req, res) => {
    if (testArticles.find((i) => i.id == req.body.id)) return res.status(400).send()
    testArticles.push({
        html: req.body.html,
        id: req.body.id,
        description: req.body.description,
        title: req.body.title,
    })

    res.status(200).send()
})

app.use(["/index.props.json", "/$"], async (req, res) => {

    const url = new URL(req.originalUrl, `https://localhost:${PORT}`)

    const isClientNavigate = url.pathname === "/index.props.json"

    const props = {
        props: testArticles
    }

    if (isClientNavigate) {
        return res.json(props)
    }

    const html = await renderToStringAsync(() => (
        <Entrypoint props={props} url={req.originalUrl}/>
    ))

    res.status(200).send(html)
});

const PORT = process.env.PORT || 8080

console.log(`Started on http://localhost:${PORT}`)
app.listen(PORT)

