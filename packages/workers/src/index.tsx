import {Router} from "itty-router";
import {IndexPage} from "./Pages/IndexPage";
import {Post} from "./Pages/Post";
import {Add} from "./Pages/Add";

const router = Router()

router
    .get("/$", IndexPage)
    .get("/index.props.json", IndexPage)

router.get("/post/:id", Post)

router.get("/add", Add)


router.get("*", () => {
    return new Response("404 Not found", {status: 404})
})

addEventListener("fetch", async event => {
    event.respondWith(router.handle(event.request))
})