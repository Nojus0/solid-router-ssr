import {IBasicPost} from "./Post";
import {For} from "solid-js";
import {Link} from "solid-app-router";
import {Title} from "@solidjs/meta";
import RouteWrapper from "../RouteWrapper";
import styles from "./Home.module.css"

function Home(props: IBasicPost[]) {

    return (
        <div class={styles.container}>
            <Title>Home Page</Title>

            <div class={styles.container_inner}>

                <For each={props}>
                    {
                        (item) => (
                            <div class={styles.post}>
                                <img class={styles.post_img} src="/placeholder.jpg"/>
                                <div class={styles.post_bottom}>
                                    <h1 class={styles.post_title}>{item.title}</h1>
                                    <p class={styles.post_description}>{item.description}</p>
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