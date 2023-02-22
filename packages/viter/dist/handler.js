export async function handler(request, renderer) {
    /** @type {IFullPost[]}*/
    const mockPosts = [
        {
            title: "first posst",
            description: "description",
            id: "first-post",
            html: "<h1>HEADER</h1>"
        },
        {
            title: "garbonzo is winonzo",
            description: "great!!l",
            id: "grabonzo-great",
            html: "<h2>SHIDD</h2>"
        }
    ];
    if (request.url == "/" || request.url == "/index.props.json" && request.method == "GET") {
        const IndexProps = {
            props: mockPosts,
            url: request.url
        };
        if (request.url == "/index.props.json") {
            return {
                status: 200,
                body: JSON.stringify(IndexProps),
                headers: { "Content-Type": "application/json" }
            };
        }
        const html = await renderer(IndexProps);
        return {
            status: 200,
            body: html,
            headers: { "Content-Type": "text/html" }
        };
    }
    return {
        status: 404,
        body: "404",
        headers: {}
    };
}
