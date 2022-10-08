import {createContext, useContext} from "solid-js";
import {isServer} from "solid-js/web";
import {IHydrationData} from "./Document";


const HydrationContext = createContext<HydrationContext>({hydratedData: {props: {}, url: "/"}, routeCache: new Map([])})

export const useHydration = () => useContext<HydrationContext>(HydrationContext)

export function HydrationProvider(p: IHydrationData & { children: any }) {


    if (!isServer) {
        const Element = document.getElementById("SSR_DATA")
        if (Element == null || Element.textContent == null) throw new Error("Element or Element text null")
        const Json = JSON.parse(Element.textContent)

        const value: HydrationContext = {
            hydratedData: {
                props: Json.props,
                url: Json.url
            },
            routeCache: new Map([
                [Json.url, Json.props]
            ])
        }
        console.log(value.routeCache)
        return (
            <HydrationContext.Provider value={value}>
                {p.children}
            </HydrationContext.Provider>
        )
    } else {

        const value: HydrationContext = {
            hydratedData: {
                url: p.url,
                props: p.props.props // Close your eyes please
            },
            routeCache: new Map([])
        }

        return <HydrationContext.Provider value={value}>
            {p.children}
        </HydrationContext.Provider>
    }

}

function HydrationStruct() {
    return {
        hydratedData: {
            props: null as any,
            url: null as unknown as string
        },
        routeCache: null as unknown as Map<string, any>
    }
}

export type HydrationContext = ReturnType<typeof HydrationStruct>