import {IBasicPost} from "./Post";
import {For} from "solid-js";
import {Link} from "solid-app-router";
import {Title} from "@solidjs/meta";
import RouteWrapper from "../RouteWrapper";


function Home(props: IBasicPost[]) {

    return (
        <>
            <Title>Home Page</Title>
            <For each={props}>
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
            <div style={{margin: "4rem 0"}}>

                <Link href="/add">
                    <button>Add New</button>
                </Link>

            </div>
        </>
    )
}


export default RouteWrapper(Home)