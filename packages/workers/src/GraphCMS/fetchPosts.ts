import {EDGE_CACHE_TTL} from "./Constants";

declare global {
    const GRAPHCMS_API_KEY: string
    const GRAPHCMS_CONTENT_ENDPOINT: string
}

export interface IGraphCMSPost {
    title: string
    postId: string
    description: string
    html: string
}


export default async function fetchPosts() {

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${GRAPHCMS_API_KEY}`);
    myHeaders.append("Content-Type", "application/json");

    const graphql = JSON.stringify({
        query: `
query QueryPosts {
  posts {
    title
    postId
    html
    description
  }
}
`,
        variables: {}
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
            data: { posts: IGraphCMSPost[] }
        }

        if (Json && Json.data && Json.data.posts) {
            return Json.data.posts
        }
        return []
    } catch
        (err) {
        return []
    }
}