import {renderToStringAsync} from "solid-js/web"
import {IFullPost} from "../../../core/app/src/Pages/Post"
import Entrypoint from "../../../core/app/src/Document"
import fetchPosts, {IGraphCMSPost} from "../GraphCMS/fetchPosts";
import {BROWSER_CACHE_TTL} from "../GraphCMS/Constants";

export const INDEX_API_RESPONSE_CACHE_KEY = "/?api_response"

export async function IndexPage(request: Request & globalThis.Request, event: FetchEvent) {

    const CachedResult = await CACHE_KV.get(INDEX_API_RESPONSE_CACHE_KEY)
    const URI = new URL(request.url)

    const API_RESPONSE: IGraphCMSPost[] = (CachedResult && JSON.parse(CachedResult)) || await fetchPosts()
    if (!CachedResult) {
        event.waitUntil(CACHE_KV.put(INDEX_API_RESPONSE_CACHE_KEY, JSON.stringify(API_RESPONSE)))
    }

    const Props = {
        props: API_RESPONSE.map((i) => ({
            id: i.postId,
            html: i.html,
            title: i.title,
            description: i.description
        }) as IFullPost)
    }

    if (URI.pathname == "/index.props.json") {
        console.log(`Responded with home page props`)
        return new Response(
            JSON.stringify(Props),
            {
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": `no-cache, no-store, max-age=${BROWSER_CACHE_TTL}, must-revalidate`,
                    "X-Cf-Kv-Cache-Status": CachedResult ? "HIT" : "MISS"
                },
                status: 200
            })
    }

    const html = await renderToStringAsync(() => (
        <Entrypoint url="/" props={Props}/>
    ))

    console.log(`Responded with home page html page`)
    return new Response(`<!DOCTYPE html>` + html, {
        headers: {
            "Content-Type": "text/html",
            "Cache-Control": `no-cache, no-store, max-age=${BROWSER_CACHE_TTL}, must-revalidate`,
            "X-Cf-Kv-Cache-Status": CachedResult ? "HIT" : "MISS"
        },
        status: 200,
    })
}
