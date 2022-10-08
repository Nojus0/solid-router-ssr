import {renderToStringAsync} from "solid-js/web";
import express from "express";
import path from "path"
import {IFullPost} from "../app/src/Pages/Post";
import Entrypoint from "../app/src/Document";

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
    }
]
app.use("/post/:id", async (req, res) => {
    const isClientNavigate = req.query.client_navigate
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


app.use(/\/$/i, async (req, res) => {

    const isClientNavigate = req.query.client_navigate

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
console.log(`Started on http://localhost`)
app.listen(80)

