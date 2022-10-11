import {Link, useParams, useRouteData} from "solid-app-router";
import {Accessor, Component, createEffect, createMemo, Resource, Show} from "solid-js";
import {Title} from "@solidjs/meta";
import {isServer} from "solid-js/web";
import RouteWrapper from "../RouteWrapper";

export interface IBasicPost {
    id: string
    title: string
    description: string
}

export type IFullPost = IBasicPost & { html: string }


function Post(p: IFullPost) {

    return (
        <div>
            <Title>Post - {p.title}</Title>
            <h1>{p.title}</h1>
            <p>{p.description}</p>
            <p innerHTML={p.html}></p>
            <Link href="/">Back</Link>
        </div>

    )

}


export default RouteWrapper<IFullPost>(Post)