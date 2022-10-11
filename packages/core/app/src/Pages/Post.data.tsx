import {RouteDataFuncArgs} from "solid-app-router";
import {isServer} from "solid-js/web";
import {createResource} from "solid-js";
import {useHydration} from "../HydrationContext";


export default function PostData(route: RouteDataFuncArgs) {
    const ctx = useHydration()
    const id = route.params.id
    const pathname = route.location.pathname

    // CLOSURE TRAP -> route param will be different or even random
    const [post] = createResource(async () => {

        if (isServer) {
            return ctx.hydratedData.props
        }

        const cached = ctx.routeCache.get(pathname)
        if (cached) {
            return cached
        }

        const NavigateResponse = await fetch(`/post/${id}.props.json`)
        const NavigateProps = await NavigateResponse.json<any>()
        const Props = NavigateProps.props

        ctx.routeCache.set(pathname, Props)
        return Props

    })


    return post
}