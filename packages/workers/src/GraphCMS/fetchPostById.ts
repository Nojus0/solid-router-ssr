import {IGraphCMSPost} from "./fetchPosts";

export default async function fetchPostById(id: string) {
    console.log("!!! FETCHING POST BY ID !!!")
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
            cacheEverything: false,
            cacheTtl: 0
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
