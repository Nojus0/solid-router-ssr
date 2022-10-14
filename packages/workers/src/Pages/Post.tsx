import {Request} from "itty-router";
import {renderToStringAsync} from "solid-js/web";
import Entrypoint from "../../../core/app/src/Document"
import fetchPostById from "../GraphCMS/fetchPostById";
import {BROWSER_CACHE_TTL, EDGE_CACHE_TTL} from "../GraphCMS/Constants";

export async function Post(request: Request & globalThis.Request) {

    if (request.params == null || !request.params.id)
        return new Response("No post id param received!", {status: 400})

    const IsPropsNavigate = request.params.id.endsWith(".props.json")

    if (IsPropsNavigate)
        request.params.id = request.params.id.slice(0, request.params.id.length - ".props.json".length)

    const ID = request.params.id
    if (ID.length < 1) return new Response(null, {status: 400})

    const Post = await fetchPostById(ID)
    if (!Post) return new Response(null, {status: 404})

    // Not realistic
    const Props = {
        props: Post
    }

    if (IsPropsNavigate) {
        console.log(`Responded to ${ID} post props`)
        return new Response(JSON.stringify(Props), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": `max-age=${BROWSER_CACHE_TTL}, must-revalidate`
            }
        })
    }


    const html = await renderToStringAsync(() =>
        <Entrypoint props={Props} url={`/post/${ID}`}/>
    )
    console.log(`Responded to ${ID} html page`)
    return new Response(`<!DOCTYPE html>` + html, {
        status: 200, headers: {
            "Content-Type": "text/html",
            "Cache-Control": `max-age=${BROWSER_CACHE_TTL}, must-revalidate`
        }
    })
}
