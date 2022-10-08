import {lazy, Suspense,} from "solid-js";
import {Route, Router, Routes} from "solid-app-router"
import HomeData from "./Pages/Home.data";
import PostData from "./Pages/Post.data";
import {HydrationProvider, useHydration} from "./HydrationContext";
import {MetaProvider, renderTags} from "@solidjs/meta"
import {Assets, HydrationScript, isServer, NoHydration} from "solid-js/web";
import Home from "./Pages/Home";
import Post from "./Pages/Post";

export interface IHydrationData {
    url: string
    props: any
}

/**
 * Checking isServer to prevent code splitting on the server, not needed unless you have large or a ton of routes
 */
const HomePage = isServer ? Home : lazy(() => import("./Pages/Home"))
const PostPage = isServer ? Post : lazy(() => import("./Pages/Post"))

function Entrypoint() {

    const ctx = useHydration()
    const tags: any[] = []

    const App = (
        <MetaProvider tags={tags}>
            <Router url={ctx.hydratedData.url}>
                <Suspense>
                    <Routes>
                        <Route path="/" data={HomeData} component={HomePage}/>
                        <Route path="/post/:id" data={PostData} component={PostPage}/>
                    </Routes>
                </Suspense>
            </Router>
        </MetaProvider>
    )

    return (
        <html lang="en">
        <head>
            <meta charset="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <link rel="stylesheet" href="https://unpkg.com/98.css@0.1.18/dist/98.css"></link>
            <link rel="stylesheet" href="/styles.css"></link>
            <Assets>
                {renderTags(tags)}
            </Assets>
            <HydrationScript/>
        </head>
        <body>
        <div id="app">
            {App}
        </div>
        </body>
        <NoHydration>
            <script id="SSR_DATA" type="application/json">
                {JSON.stringify(ctx.hydratedData)}
            </script>

            <script type="module" src="/js/index.js" async></script>
        </NoHydration>
        </html>
    );
}

function EntrypointWrapper(p: IHydrationData) {

    return <HydrationProvider props={p.props} url={p.url}>
        <Entrypoint/>
    </HydrationProvider>
}

export default EntrypointWrapper

