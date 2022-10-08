import {createResource} from "solid-js";
import {RouteDataFuncArgs} from "solid-app-router";
import {isServer} from "solid-js/web";
import {useHydration} from "../HydrationContext";
import * as path from "path";


export default function HomeData(route: RouteDataFuncArgs) {
    const ctx = useHydration()
    const pathname = route.location.pathname

    const [homePosts] = createResource(async (id) => {

        if (isServer) {
            return ctx.hydratedData.props
        }

        const cached = ctx.routeCache.get(pathname)

        if (cached) {
            return cached
        }

        const NavigateResponse = await fetch(`/?client_navigate=1`)
        const NavigateProps = await NavigateResponse.json()
        const Props = NavigateProps.props
        ctx.routeCache.set(pathname, Props)
        console.log(ctx.routeCache)
        return Props
    });

    return homePosts;
}