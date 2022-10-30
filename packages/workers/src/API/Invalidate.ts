import {Request} from "itty-router";
import {INDEX_API_RESPONSE_CACHE_KEY} from "../Pages/IndexPage";
import {POST_API_RESPONSE_CACHE_KEY} from "../Pages/Post";


export async function Invalidate(request: Request & globalThis.Request, event: FetchEvent) {

    const Payload = await request.json()

    const ID = Payload.data.postId;
    console.log(ID)
    event.waitUntil(
        Promise.all([
                CACHE_KV.delete(INDEX_API_RESPONSE_CACHE_KEY),
                CACHE_KV.delete(POST_API_RESPONSE_CACHE_KEY(ID))
            ]
        )
    )


    return new Response(null, {status: 200})
}