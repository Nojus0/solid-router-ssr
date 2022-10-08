import {IBasicPost} from "./Post";
import {Accessor, For, Resource} from "solid-js";
import {Link, useRouteData} from "solid-app-router";

export type HomeProps = { posts: IBasicPost[] }

function Home() {

    const props = useRouteData() as unknown as Resource<IBasicPost[]>

    return (
        <For each={props()}>
            {
                (item) => (
                    <div>
                        <h1>{item.title}</h1>
                        <p>{item.description}</p>
                        <Link href={`/post/${item.id}`}>Read</Link>
                    </div>
                )
            }
        </For>
    )
}


export default Home