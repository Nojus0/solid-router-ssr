import {renderToString, renderToStringAsync} from "solid-js/web";
import express from "express";
import path from "path"
import {IFullPost} from "../app/src/Pages/Post";
import Entrypoint from "../app/src/Document";
import process from "process";
import fs from "fs"

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


app.use(["/:after", "/$"], async (req, res) => {

    const isClientNavigate = req.params.after == ".props.json"

    // If isn't props and is defined something else
    if (req.params.after != ".props.json" && req.params.after != undefined) {
        return res.status(404).send()
    }

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

function testStatic() {
    const root = renderToString(() => (
        <Entrypoint url="/" props={{props: testArticles}}/>
    ))


    fs.mkdirSync("./static_test")
    fs.mkdirSync("./static_test/post/")

    fs.writeFileSync("./static_test/index", root)
    fs.writeFileSync("./static_test/.props.json", JSON.stringify({props: testArticles}))

    for (const article of testArticles) {
        const Page = renderToString(() => (
            <Entrypoint url={`/post/${article.id}`} props={{props: article}}/>
        ))

        fs.writeFileSync(`./static_test/post/${article.id}`, Page)
        fs.writeFileSync(`./static_test/post/${article.id}.props.json`, JSON.stringify({props: article}))
    }

}

testStatic()
const PORT = process.env.PORT || 8080

console.log(`Started on http://localhost:${PORT}`)
app.listen(PORT)

