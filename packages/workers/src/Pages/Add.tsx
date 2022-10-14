import {renderToStringAsync} from "solid-js/web";
import Entrypoint from "../../../core/app/src/Document"

export async function Add(request: Request & globalThis.Request) {

    const html = await renderToStringAsync(() => (
        <Entrypoint url={"/add"} props={{}}/>
    ))
    console.log(`Responded to add html page`)

    return new Response(`<!DOCTYPE html>` + html, {
        headers: {
            "Content-Type": "text/html",
            "Cache-Control": "max-age: 120"
        }, status: 200
    })
}
