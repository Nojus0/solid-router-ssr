import {Link, useParams, useRouteData} from "solid-app-router";
import {Accessor, Resource} from "solid-js";
import {Title} from "@solidjs/meta";

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
            <Title>Post - {props()?.title}</Title>
            <h1>{props()?.title}</h1>
            <p>{props()?.description}</p>
            <p innerHTML={props()?.html}></p>
            <Link href="/">Back</Link>
        </div>
    )

}

export default Post