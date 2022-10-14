import {IGraphCMSPost} from "./fetchPosts";
import {EDGE_CACHE_TTL} from "./Constants";

export default async function fetchPostById(id: string) {

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${GRAPHCMS_API_KEY}`);
    myHeaders.append("Content-Type", "application/json");

    const graphql = JSON.stringify({
        query: `
query QueryPosts($id: String) {
  post:apiPosts(where: {postId: $id}) {
    id
    html
    description
    postId
    title
  }
}
`,
        variables: {id}
    })
    const requestOptions: Request | RequestInit = {
        method: 'POST',
        headers: myHeaders,
        body: graphql,
        redirect: 'follow',
        cf: {
            cacheEverything: true,
            cacheTtl: EDGE_CACHE_TTL,
        },
    };

    try {
        const Response = await fetch(GRAPHCMS_CONTENT_ENDPOINT, requestOptions)
        const Json = await Response.json() as {
            data: { post: IGraphCMSPost }
        }

        if (Json && Json.data && Json.data.post) {
            return Json.data.post
        }
        return null
    } catch
        (err) {
        return null
    }
}
