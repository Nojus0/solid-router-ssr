import {lazy, Suspense,} from "solid-js";
import {HydrationScript, isServer, NoHydration} from "solid-js/web";
import {Router, Routes, Route} from "solid-app-router"
import HomeData from "./Pages/Home.data";
import PostData from "./Pages/Post.data";
import {HydrationProvider, useHydration} from "./HydrationContext";

export interface IHydrationData {
    url: string
    props: any
}

const HomePage = lazy(() => import("./Pages/Home"))
const PostPage = lazy(() => import("./Pages/Post"))

function Entrypoint() {

    const ctx = useHydration()
    console.log(`Render Entrypoint`)
    return (
        <html lang="en">
        <head>
            <title>TODO: Title</title>
            <meta charset="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <link rel="stylesheet" href="https://unpkg.com/98.css"></link>
            <link rel="stylesheet" href="/styles.css"></link>
            <HydrationScript/>
        </head>
        <body>
        <div id="app">
            <Router url={ctx.hydratedData.url}>
                <Suspense>
                    <Routes>
                        <Route path="/" data={HomeData} component={HomePage}/>
                        <Route path="/post/:id" data={PostData} component={PostPage}/>
                    </Routes>
                </Suspense>
            </Router>
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
};

function EntrypointWrapper(p: IHydrationData) {

    return <HydrationProvider props={p.props} url={p.url}>
        <Entrypoint/>
    </HydrationProvider>
}

export default EntrypointWrapper

