import {For} from "solid-js";
import {Link} from "solid-app-router";
import {Title} from "@solidjs/meta";
import styles from "./Home.module.css"
import {IFullPost} from "./Post";
import RouteWrapper from "../RouteWrapper";

function Home(props: IFullPost[]) {
    console.log(props)
    return (
        <div class={styles.container}>
            <Title>Home Page</Title>

            <div class={styles.container_inner}>
                <For each={props}>
                    {
                        (item) => (
                            <div class={styles.post}>
                                <img class={styles.post_img} src="https://images.unsplash.com/photo-1548876995-629f48ad9a6c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dHVuZHJhfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=600&q=60"/>
                                <div class={styles.post_bottom}>
                                    <h1 class={styles.post_title}>{item.title}</h1>
                                    <p class={styles.post_description}>{item.description}</p>
                                    <Link href={`/post/${item.id}`}>Go</Link>
                                </div>
                            </div>
                        )
                    }
                </For>

            </div>
            <div style={{margin: "4rem 0"}}>
                <Link href="/add">
                    <button>Add New</button>
                </Link>
            </div>

        </div>
    )
}


export default RouteWrapper(Home)