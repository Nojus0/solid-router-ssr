import {renderToStringAsync} from "solid-js/web"
import {IFullPost} from "../../../core/app/src/Pages/Post"
import Entrypoint from "../../../core/app/src/Document"
import fetchPosts from "../GraphCMS/fetchPosts";

export async function IndexPage(request: Request & globalThis.Request) {
    const URI = new URL(request.url)
    const API_RESPONSE = await fetchPosts()
    const Props = {
        props: API_RESPONSE.map((i) => ({
            id: i.postId,
            html: i.html,
            title: i.title,
            description: i.description
        }) as IFullPost)
    }

    if (URI.pathname == "/index.props.json") {

        return new Response(
            JSON.stringify(Props),
            {
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "max-age=5"
                },
                status: 200
            })
    }

    const html = await renderToStringAsync(() => (
        <Entrypoint url={request.url} props={Props}/>
    ))

    return new Response(`<!DOCTYPE html>` + html, {
        headers: {
            "Content-Type": "text/html",
            "Cache-Control": "max-age=5"
        },
        status: 200,
    })
}
