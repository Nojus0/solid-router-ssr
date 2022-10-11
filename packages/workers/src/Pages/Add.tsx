import {renderToStringAsync} from "solid-js/web";
import Entrypoint from "../../../core/app/src/Document"

export async function Add(request: Request & globalThis.Request) {

    const html = await renderToStringAsync(() => (
        <Entrypoint url={request.url} props={{}}/>
    ))

    return new Response(`<!DOCTYPE html>` + html, {
        headers: {
            "Content-Type": "text/html",
            "Cache-Control": "max-age=5"
        }, status: 200
    })
}
