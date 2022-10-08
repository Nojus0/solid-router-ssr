import {Link, useParams, useRouteData} from "solid-app-router";
import {Accessor, Resource} from "solid-js";

export interface IBasicPost {
    id: string
    title: string
    description: string
}

export type IFullPost = IBasicPost & { html: string }


function Post() {
    const props = useRouteData() as unknown as Resource<IFullPost>

    return (
        <div>
            <h1>{props()?.title}</h1>
            <p>{props()?.description}</p>
            <p innerHTML={props()?.html}></p>
            <Link href="/">Back</Link>
        </div>
    )

}

export default Post