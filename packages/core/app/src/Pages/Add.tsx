import {createSignal} from "solid-js";
import {Link, useNavigate} from "solid-app-router";
import {useHydration} from "../HydrationContext";

function Add() {

    const [id, setId] = createSignal("")
    const [title, setTitle] = createSignal("")
    const [description, setDescription] = createSignal("")
    const [html, setHtml] = createSignal("")
    const navigate = useNavigate()
    const ctx = useHydration()

    async function submit() {
        const Response = await fetch("/api/_add_new", {
            method: "POST",
            body: JSON.stringify({
                id: id(),
                title: title(),
                description: description(),
                html: html()
            }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        ctx.routeCache.delete("/")
        if (Response.status == 200) {
            navigate("/")
        }
    }

    return (
        <div>

            <div class="field-row-stacked" style="width: 200px">
                <label for="text18">Id</label>
                <input value={id()} onInput={(e) => setId(e.currentTarget.value)} id="text18" type="text"/>
            </div>
            <div class="field-row-stacked" style="width: 200px">
                <label for="text18">Title</label>
                <input value={title()} onInput={(e) => setTitle(e.currentTarget.value)} id="text18" type="text"/>
            </div>
            <div class="field-row-stacked" style="width: 200px">
                <label for="text19">Description</label>
                <input value={description()} onInput={(e) => setDescription(e.currentTarget.value)} id="text19"
                       type="text"/>
            </div>
            <div class="field-row-stacked" style="width: 200px">
                <label for="text20">HTML</label>
                <textarea value={html()} onInput={(e) => setHtml(e.currentTarget.value)} id="text20"
                          rows="8"></textarea>
            </div>
            <button style={{margin: "2rem 0"}} onClick={submit}>Submit</button>
            <div>

                <Link href="/">Back</Link>
            </div>
        </div>
    )
}

export default Add