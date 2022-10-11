import {useRouteData} from "solid-app-router";
import {createMemo, Resource, Show} from "solid-js";

export default function RouteWrapper<Type>(Comp: any) {
    return () => {
        const routeData = useRouteData() as unknown as Resource<Type>

        const props = createMemo(() => routeData())

        return (
            <Show when={props()} keyed>
                <Comp {...props()}/>
            </Show>
        )
    }
}
