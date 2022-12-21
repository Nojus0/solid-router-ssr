import { isServer, createComponent as createComponent$1, mergeProps, ssrElement, escape, spread, ssr, ssrHydrationKey, ssrAttribute, NoHydration, Assets, HydrationScript, renderToStringAsync } from 'solid-js/web';
import { createSignal, onCleanup, getOwner, runWithOwner, createMemo, createContext, useContext, useTransition, createRenderEffect, untrack, createComponent, on, resetErrorBoundaries, splitProps, children, createRoot, Show, mergeProps as mergeProps$1, createResource, createUniqueId, sharedConfig, For, lazy, Suspense } from 'solid-js';

function e({
  base: t = "",
  routes: n = []
} = {}) {
  return {
    __proto__: new Proxy({}, {
      get: (e, a, o) => (e, ...r) => n.push([a.toUpperCase(), RegExp(`^${(t + e).replace(/(\/?)\*/g, "($1.*)?").replace(/(\/$)|((?<=\/)\/)/, "").replace(/:(\w+)(\?)?(\.)?/g, "$2(?<$1>[^/]+)$2$3").replace(/\.(?=[\w(])/, "\\.").replace(/\)\.\?\(([^\[]+)\[\^/g, "?)\\.?($1(?<=\\.)[^\\.")}/*$`), r]) && o
    }),
    routes: n,
    async handle(e, ...r) {
      let a,
        o,
        t = new URL(e.url);
      e.query = Object.fromEntries(t.searchParams);
      for (var [p, s, u] of n) if ((p === e.method || "ALL" === p) && (o = t.pathname.match(s))) {
        e.params = o.groups;
        for (var c of u) if (void 0 !== (a = await c(e.proxy || e, ...r))) return a;
      }
    }
  };
}

function bindEvent(target, type, handler) {
  target.addEventListener(type, handler);
  return () => target.removeEventListener(type, handler);
}
function intercept([value, setValue], get, set) {
  return [get ? () => get(value()) : value, set ? v => setValue(set(v)) : setValue];
}
function querySelector(selector) {
  // Guard against selector being an invalid CSS selector
  try {
    return document.querySelector(selector);
  } catch (e) {
    return null;
  }
}
function scrollToHash(hash, fallbackTop) {
  const el = querySelector(`#${hash}`);
  if (el) {
    el.scrollIntoView();
  } else if (fallbackTop) {
    window.scrollTo(0, 0);
  }
}
function createIntegration(get, set, init, utils) {
  let ignore = false;
  const wrap = value => typeof value === "string" ? {
    value
  } : value;
  const signal = intercept(createSignal(wrap(get()), {
    equals: (a, b) => a.value === b.value
  }), undefined, next => {
    !ignore && set(next);
    return next;
  });
  init && onCleanup(init((value = get()) => {
    ignore = true;
    signal[1](wrap(value));
    ignore = false;
  }));
  return {
    signal,
    utils
  };
}
function normalizeIntegration(integration) {
  if (!integration) {
    return {
      signal: createSignal({
        value: ""
      })
    };
  } else if (Array.isArray(integration)) {
    return {
      signal: integration
    };
  }
  return integration;
}
function staticIntegration(obj) {
  return {
    signal: [() => obj, next => Object.assign(obj, next)]
  };
}
function pathIntegration() {
  return createIntegration(() => ({
    value: window.location.pathname + window.location.search + window.location.hash,
    state: history.state
  }), ({
    value,
    replace,
    scroll,
    state
  }) => {
    if (replace) {
      window.history.replaceState(state, "", value);
    } else {
      window.history.pushState(state, "", value);
    }
    scrollToHash(window.location.hash.slice(1), scroll);
  }, notify => bindEvent(window, "popstate", () => notify()), {
    go: delta => window.history.go(delta)
  });
}

const hasSchemeRegex = /^(?:[a-z0-9]+:)?\/\//i;
const trimPathRegex = /^\/+|\/+$/g;
function normalize(path, omitSlash = false) {
  const s = path.replace(trimPathRegex, "");
  return s ? omitSlash || /^[?#]/.test(s) ? s : "/" + s : "";
}
function resolvePath(base, path, from) {
  if (hasSchemeRegex.test(path)) {
    return undefined;
  }
  const basePath = normalize(base);
  const fromPath = from && normalize(from);
  let result = "";
  if (!fromPath || path.startsWith("/")) {
    result = basePath;
  } else if (fromPath.toLowerCase().indexOf(basePath.toLowerCase()) !== 0) {
    result = basePath + fromPath;
  } else {
    result = fromPath;
  }
  return (result || "/") + normalize(path, !result);
}
function invariant(value, message) {
  if (value == null) {
    throw new Error(message);
  }
  return value;
}
function joinPaths(from, to) {
  return normalize(from).replace(/\/*(\*.*)?$/g, "") + normalize(to);
}
function extractSearchParams(url) {
  const params = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}
function urlDecode(str, isQuery) {
  return decodeURIComponent(isQuery ? str.replace(/\+/g, " ") : str);
}
function createMatcher(path, partial) {
  const [pattern, splat] = path.split("/*", 2);
  const segments = pattern.split("/").filter(Boolean);
  const len = segments.length;
  return location => {
    const locSegments = location.split("/").filter(Boolean);
    const lenDiff = locSegments.length - len;
    if (lenDiff < 0 || lenDiff > 0 && splat === undefined && !partial) {
      return null;
    }
    const match = {
      path: len ? "" : "/",
      params: {}
    };
    for (let i = 0; i < len; i++) {
      const segment = segments[i];
      const locSegment = locSegments[i];
      if (segment[0] === ":") {
        match.params[segment.slice(1)] = locSegment;
      } else if (segment.localeCompare(locSegment, undefined, {
        sensitivity: "base"
      }) !== 0) {
        return null;
      }
      match.path += `/${locSegment}`;
    }
    if (splat) {
      match.params[splat] = lenDiff ? locSegments.slice(-lenDiff).join("/") : "";
    }
    return match;
  };
}
function scoreRoute(route) {
  const [pattern, splat] = route.pattern.split("/*", 2);
  const segments = pattern.split("/").filter(Boolean);
  return segments.reduce((score, segment) => score + (segment.startsWith(":") ? 2 : 3), segments.length - (splat === undefined ? 0 : 1));
}
function createMemoObject(fn) {
  const map = new Map();
  const owner = getOwner();
  return new Proxy({}, {
    get(_, property) {
      if (!map.has(property)) {
        runWithOwner(owner, () => map.set(property, createMemo(() => fn()[property])));
      }
      return map.get(property)();
    },
    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true
      };
    },
    ownKeys() {
      return Reflect.ownKeys(fn());
    }
  });
}
function expandOptionals(pattern) {
  let match = /(\/?\:[^\/]+)\?/.exec(pattern);
  if (!match) return [pattern];
  let prefix = pattern.slice(0, match.index);
  let suffix = pattern.slice(match.index + match[0].length);
  const prefixes = [prefix, prefix += match[1]];
  // This section handles adjacent optional params. We don't actually want all permuations since
  // that will lead to equivalent routes which have the same number of params. For example
  // `/:a?/:b?/:c`? only has the unique expansion: `/`, `/:a`, `/:a/:b`, `/:a/:b/:c` and we can
  // discard `/:b`, `/:c`, `/:b/:c` by building them up in order and not recursing. This also helps
  // ensure predictability where earlier params have precidence.
  while (match = /^(\/\:[^\/]+)\?/.exec(suffix)) {
    prefixes.push(prefix += match[1]);
    suffix = suffix.slice(match[0].length);
  }
  return expandOptionals(suffix).reduce((results, expansion) => [...results, ...prefixes.map(p => p + expansion)], []);
}

const MAX_REDIRECTS = 100;
const RouterContextObj = createContext();
const RouteContextObj = createContext();
const useRouter = () => invariant(useContext(RouterContextObj), "Make sure your app is wrapped in a <Router />");
let TempRoute;
const useRoute = () => TempRoute || useContext(RouteContextObj) || useRouter().base;
const useResolvedPath = path => {
  const route = useRoute();
  return createMemo(() => route.resolvePath(path()));
};
const useHref = to => {
  const router = useRouter();
  return createMemo(() => {
    const to_ = to();
    return to_ !== undefined ? router.renderPath(to_) : to_;
  });
};
const useNavigate = () => useRouter().navigatorFactory();
const useRouteData = () => useRoute().data;
function createRoutes(routeDef, base = "", fallback) {
  const {
    component,
    data,
    children
  } = routeDef;
  const isLeaf = !children || Array.isArray(children) && !children.length;
  const shared = {
    key: routeDef,
    element: component ? () => createComponent(component, {}) : () => {
      const {
        element
      } = routeDef;
      return element === undefined && fallback ? createComponent(fallback, {}) : element;
    },
    preload: routeDef.component ? component.preload : routeDef.preload,
    data
  };
  return asArray(routeDef.path).reduce((acc, path) => {
    for (const originalPath of expandOptionals(path)) {
      const path = joinPaths(base, originalPath);
      const pattern = isLeaf ? path : path.split("/*", 1)[0];
      acc.push({
        ...shared,
        originalPath,
        pattern,
        matcher: createMatcher(pattern, !isLeaf)
      });
    }
    return acc;
  }, []);
}
function createBranch(routes, index = 0) {
  return {
    routes,
    score: scoreRoute(routes[routes.length - 1]) * 10000 - index,
    matcher(location) {
      const matches = [];
      for (let i = routes.length - 1; i >= 0; i--) {
        const route = routes[i];
        const match = route.matcher(location);
        if (!match) {
          return null;
        }
        matches.unshift({
          ...match,
          route
        });
      }
      return matches;
    }
  };
}
function asArray(value) {
  return Array.isArray(value) ? value : [value];
}
function createBranches(routeDef, base = "", fallback, stack = [], branches = []) {
  const routeDefs = asArray(routeDef);
  for (let i = 0, len = routeDefs.length; i < len; i++) {
    const def = routeDefs[i];
    if (def && typeof def === "object" && def.hasOwnProperty("path")) {
      const routes = createRoutes(def, base, fallback);
      for (const route of routes) {
        stack.push(route);
        if (def.children) {
          createBranches(def.children, route.pattern, fallback, stack, branches);
        } else {
          const branch = createBranch([...stack], branches.length);
          branches.push(branch);
        }
        stack.pop();
      }
    }
  }
  // Stack will be empty on final return
  return stack.length ? branches : branches.sort((a, b) => b.score - a.score);
}
function getRouteMatches(branches, location) {
  for (let i = 0, len = branches.length; i < len; i++) {
    const match = branches[i].matcher(location);
    if (match) {
      return match;
    }
  }
  return [];
}
function createLocation(path, state) {
  const origin = new URL("http://sar");
  const url = createMemo(prev => {
    const path_ = path();
    try {
      return new URL(path_, origin);
    } catch (err) {
      console.error(`Invalid path ${path_}`);
      return prev;
    }
  }, origin, {
    equals: (a, b) => a.href === b.href
  });
  const pathname = createMemo(() => urlDecode(url().pathname));
  const search = createMemo(() => urlDecode(url().search, true));
  const hash = createMemo(() => urlDecode(url().hash));
  const key = createMemo(() => "");
  return {
    get pathname() {
      return pathname();
    },
    get search() {
      return search();
    },
    get hash() {
      return hash();
    },
    get state() {
      return state();
    },
    get key() {
      return key();
    },
    query: createMemoObject(on(search, () => extractSearchParams(url())))
  };
}
function createRouterContext(integration, base = "", data, out) {
  const {
    signal: [source, setSource],
    utils = {}
  } = normalizeIntegration(integration);
  const parsePath = utils.parsePath || (p => p);
  const renderPath = utils.renderPath || (p => p);
  const basePath = resolvePath("", base);
  const output = isServer && out ? Object.assign(out, {
    matches: [],
    url: undefined
  }) : undefined;
  if (basePath === undefined) {
    throw new Error(`${basePath} is not a valid base path`);
  } else if (basePath && !source().value) {
    setSource({
      value: basePath,
      replace: true,
      scroll: false
    });
  }
  const [isRouting, start] = useTransition();
  const [reference, setReference] = createSignal(source().value);
  const [state, setState] = createSignal(source().state);
  const location = createLocation(reference, state);
  const referrers = [];
  const baseRoute = {
    pattern: basePath,
    params: {},
    path: () => basePath,
    outlet: () => null,
    resolvePath(to) {
      return resolvePath(basePath, to);
    }
  };
  if (data) {
    try {
      TempRoute = baseRoute;
      baseRoute.data = data({
        data: undefined,
        params: {},
        location,
        navigate: navigatorFactory(baseRoute)
      });
    } finally {
      TempRoute = undefined;
    }
  }
  function navigateFromRoute(route, to, options) {
    // Untrack in case someone navigates in an effect - don't want to track `reference` or route paths
    untrack(() => {
      if (typeof to === "number") {
        if (!to) ; else if (utils.go) {
          utils.go(to);
        } else {
          console.warn("Router integration does not support relative routing");
        }
        return;
      }
      const {
        replace,
        resolve,
        scroll,
        state: nextState
      } = {
        replace: false,
        resolve: true,
        scroll: true,
        ...options
      };
      const resolvedTo = resolve ? route.resolvePath(to) : resolvePath("", to);
      if (resolvedTo === undefined) {
        throw new Error(`Path '${to}' is not a routable path`);
      } else if (referrers.length >= MAX_REDIRECTS) {
        throw new Error("Too many redirects");
      }
      const current = reference();
      if (resolvedTo !== current || nextState !== state()) {
        if (isServer) {
          if (output) {
            output.url = resolvedTo;
          }
          setSource({
            value: resolvedTo,
            replace,
            scroll,
            state: nextState
          });
        } else {
          const len = referrers.push({
            value: current,
            replace,
            scroll,
            state: state()
          });
          start(() => {
            setReference(resolvedTo);
            setState(nextState);
            resetErrorBoundaries();
          }).then(() => {
            if (referrers.length === len) {
              navigateEnd({
                value: resolvedTo,
                state: nextState
              });
            }
          });
        }
      }
    });
  }
  function navigatorFactory(route) {
    // Workaround for vite issue (https://github.com/vitejs/vite/issues/3803)
    route = route || useContext(RouteContextObj) || baseRoute;
    return (to, options) => navigateFromRoute(route, to, options);
  }
  function navigateEnd(next) {
    const first = referrers[0];
    if (first) {
      if (next.value !== first.value || next.state !== first.state) {
        setSource({
          ...next,
          replace: first.replace,
          scroll: first.scroll
        });
      }
      referrers.length = 0;
    }
  }
  createRenderEffect(() => {
    const {
      value,
      state
    } = source();
    // Untrack this whole block so `start` doesn't cause Solid's Listener to be preserved
    untrack(() => {
      if (value !== reference()) {
        start(() => {
          setReference(value);
          setState(state);
        });
      }
    });
  });
  if (!isServer) {
    function isSvg(el) {
      return el.namespaceURI === "http://www.w3.org/2000/svg";
    }
    function handleAnchorClick(evt) {
      if (evt.defaultPrevented || evt.button !== 0 || evt.metaKey || evt.altKey || evt.ctrlKey || evt.shiftKey) return;
      const a = evt.composedPath().find(el => el instanceof Node && el.nodeName.toUpperCase() === "A");
      if (!a) return;
      const svg = isSvg(a);
      const href = svg ? a.href.baseVal : a.href;
      const target = svg ? a.target.baseVal : a.target;
      if (target || !href && !a.hasAttribute("state")) return;
      const rel = (a.getAttribute("rel") || "").split(/\s+/);
      if (a.hasAttribute("download") || rel && rel.includes("external")) return;
      const url = svg ? new URL(href, document.baseURI) : new URL(href);
      const pathname = urlDecode(url.pathname);
      if (url.origin !== window.location.origin || basePath && pathname && !pathname.toLowerCase().startsWith(basePath.toLowerCase())) return;
      const to = parsePath(pathname + urlDecode(url.search, true) + urlDecode(url.hash));
      const state = a.getAttribute("state");
      evt.preventDefault();
      navigateFromRoute(baseRoute, to, {
        resolve: false,
        replace: a.hasAttribute("replace"),
        scroll: !a.hasAttribute("noscroll"),
        state: state && JSON.parse(state)
      });
    }
    document.addEventListener("click", handleAnchorClick);
    onCleanup(() => document.removeEventListener("click", handleAnchorClick));
  }
  return {
    base: baseRoute,
    out: output,
    location,
    isRouting,
    renderPath,
    parsePath,
    navigatorFactory
  };
}
function createRouteContext(router, parent, child, match) {
  const {
    base,
    location,
    navigatorFactory
  } = router;
  const {
    pattern,
    element: outlet,
    preload,
    data
  } = match().route;
  const path = createMemo(() => match().path);
  const params = createMemoObject(() => match().params);
  preload && preload();
  const route = {
    parent,
    pattern,
    get child() {
      return child();
    },
    path,
    params,
    data: parent.data,
    outlet,
    resolvePath(to) {
      return resolvePath(base.path(), to, path());
    }
  };
  if (data) {
    try {
      TempRoute = route;
      route.data = data({
        data: parent.data,
        params,
        location,
        navigate: navigatorFactory(route)
      });
    } finally {
      TempRoute = undefined;
    }
  }
  return route;
}

const Router = props => {
  const {
    source,
    url,
    base,
    data,
    out
  } = props;
  const integration = source || (isServer ? staticIntegration({
    value: url || ""
  }) : pathIntegration());
  const routerState = createRouterContext(integration, base, data, out);
  return createComponent$1(RouterContextObj.Provider, {
    value: routerState,
    get children() {
      return props.children;
    }
  });
};
const Routes = props => {
  const router = useRouter();
  const parentRoute = useRoute();
  const routeDefs = children(() => props.children);
  const branches = createMemo(() => createBranches(routeDefs(), joinPaths(parentRoute.pattern, props.base || ""), Outlet));
  const matches = createMemo(() => getRouteMatches(branches(), router.location.pathname));
  if (router.out) {
    router.out.matches.push(matches().map(({
      route,
      path,
      params
    }) => ({
      originalPath: route.originalPath,
      pattern: route.pattern,
      path,
      params
    })));
  }
  const disposers = [];
  let root;
  const routeStates = createMemo(on(matches, (nextMatches, prevMatches, prev) => {
    let equal = prevMatches && nextMatches.length === prevMatches.length;
    const next = [];
    for (let i = 0, len = nextMatches.length; i < len; i++) {
      const prevMatch = prevMatches && prevMatches[i];
      const nextMatch = nextMatches[i];
      if (prev && prevMatch && nextMatch.route.key === prevMatch.route.key) {
        next[i] = prev[i];
      } else {
        equal = false;
        if (disposers[i]) {
          disposers[i]();
        }
        createRoot(dispose => {
          disposers[i] = dispose;
          next[i] = createRouteContext(router, next[i - 1] || parentRoute, () => routeStates()[i + 1], () => matches()[i]);
        });
      }
    }
    disposers.splice(nextMatches.length).forEach(dispose => dispose());
    if (prev && equal) {
      return prev;
    }
    root = next[0];
    return next;
  }));
  return createComponent$1(Show, {
    get when() {
      return routeStates() && root;
    },
    children: route => createComponent$1(RouteContextObj.Provider, {
      value: route,
      get children() {
        return route.outlet();
      }
    })
  });
};
const Route = props => {
  const childRoutes = children(() => props.children);
  return mergeProps$1(props, {
    get children() {
      return childRoutes();
    }
  });
};
const Outlet = () => {
  const route = useRoute();
  return createComponent$1(Show, {
    get when() {
      return route.child;
    },
    children: child => createComponent$1(RouteContextObj.Provider, {
      value: child,
      get children() {
        return child.outlet();
      }
    })
  });
};
function LinkBase(props) {
  const [, rest] = splitProps(props, ["children", "to", "href", "state"]);
  const href = useHref(() => props.to);
  return ssrElement("a", () => ({
    ...rest,
    "href": href() || props.href,
    "state": JSON.stringify(props.state)
  }), () => escape(props.children), true);
}
function Link(props) {
  const to = useResolvedPath(() => props.href);
  return createComponent$1(LinkBase, mergeProps(props, {
    get to() {
      return to();
    }
  }));
}

const HydrationContext = createContext({
  hydratedData: {
    props: {},
    url: "/"
  },
  routeCache: new Map([])
});
const useHydration = () => useContext(HydrationContext);
function HydrationProvider(p) {
  if (!isServer) {
    const Element = document.getElementById("SSR_DATA");
    if (Element == null || Element.textContent == null) throw new Error("Element or Element text null");
    const Json = JSON.parse(Element.textContent);
    const value = {
      hydratedData: {
        props: Json.props,
        url: Json.url
      },
      routeCache: new Map([[Json.url, Json.props]])
    };
    !isServer && console.log(value.routeCache);
    return createComponent$1(HydrationContext.Provider, {
      value: value,
      get children() {
        return p.children;
      }
    });
  } else {
    const value = {
      hydratedData: {
        url: p.url,
        props: p.props.props // Close your eyes please
      },

      routeCache: new Map([])
    };
    return createComponent$1(HydrationContext.Provider, {
      value: value,
      get children() {
        return p.children;
      }
    });
  }
}

function HomeData(route) {
  const ctx = useHydration();
  const pathname = route.location.pathname;
  const [homePosts] = createResource(async () => {
    if (isServer) {
      return ctx.hydratedData.props;
    }
    const cached = ctx.routeCache.get(pathname);
    if (cached) {
      return cached;
    }
    const NavigateResponse = await fetch(`/index.props.json`);
    const NavigateProps = await NavigateResponse.json();
    const Props = NavigateProps.props;
    ctx.routeCache.set(pathname, Props);
    !isServer && console.log(ctx.routeCache);
    return Props;
  });
  return homePosts;
}

function PostData(route) {
  const ctx = useHydration();
  const id = route.params.id;
  const pathname = route.location.pathname;

  // CLOSURE TRAP -> route param will be different or even random
  const [post] = createResource(async () => {
    if (isServer) {
      return ctx.hydratedData.props;
    }
    const cached = ctx.routeCache.get(pathname);
    if (cached) {
      return cached;
    }
    const NavigateResponse = await fetch(`/post/${id}.props.json`);
    const NavigateProps = await NavigateResponse.json();
    const Props = NavigateProps.props;
    ctx.routeCache.set(pathname, Props);
    !isServer && console.log(ctx.routeCache);
    return Props;
  });
  return post;
}

const MetaContext = createContext();
const cascadingTags = ["title", "meta"];
const getTagType = tag => tag.tag + (tag.name ? `.${tag.name}"` : "");
const MetaProvider = props => {
  if (!isServer && !sharedConfig.context) {
    const ssrTags = document.head.querySelectorAll(`[data-sm]`);
    // `forEach` on `NodeList` is not supported in Googlebot, so use a workaround
    Array.prototype.forEach.call(ssrTags, ssrTag => ssrTag.parentNode.removeChild(ssrTag));
  }
  const cascadedTagInstances = new Map();
  // TODO: use one element for all tags of the same type, just swap out
  // where the props get applied
  function getElement(tag) {
    if (tag.ref) {
      return tag.ref;
    }
    let el = document.querySelector(`[data-sm="${tag.id}"]`);
    if (el) {
      if (el.tagName.toLowerCase() !== tag.tag) {
        if (el.parentNode) {
          // remove the old tag
          el.parentNode.removeChild(el);
        }
        // add the new tag
        el = document.createElement(tag.tag);
      }
      // use the old tag
      el.removeAttribute("data-sm");
    } else {
      // create a new tag
      el = document.createElement(tag.tag);
    }
    return el;
  }
  const actions = {
    addClientTag: tag => {
      let tagType = getTagType(tag);
      if (cascadingTags.indexOf(tag.tag) !== -1) {
        //  only cascading tags need to be kept as singletons
        if (!cascadedTagInstances.has(tagType)) {
          cascadedTagInstances.set(tagType, []);
        }
        let instances = cascadedTagInstances.get(tagType);
        let index = instances.length;
        instances = [...instances, tag];
        // track indices synchronously
        cascadedTagInstances.set(tagType, instances);
        if (!isServer) {
          let element = getElement(tag);
          tag.ref = element;
          spread(element, tag.props);
          let lastVisited = null;
          for (var i = index - 1; i >= 0; i--) {
            if (instances[i] != null) {
              lastVisited = instances[i];
              break;
            }
          }
          if (element.parentNode != document.head) {
            document.head.appendChild(element);
          }
          if (lastVisited && lastVisited.ref) {
            document.head.removeChild(lastVisited.ref);
          }
        }
        return index;
      }
      if (!isServer) {
        let element = getElement(tag);
        tag.ref = element;
        spread(element, tag.props);
        if (element.parentNode != document.head) {
          document.head.appendChild(element);
        }
      }
      return -1;
    },
    removeClientTag: (tag, index) => {
      const tagName = getTagType(tag);
      if (tag.ref) {
        const t = cascadedTagInstances.get(tagName);
        if (t) {
          if (tag.ref.parentNode) {
            tag.ref.parentNode.removeChild(tag.ref);
            for (let i = index - 1; i >= 0; i--) {
              if (t[i] != null) {
                document.head.appendChild(t[i].ref);
              }
            }
          }
          t[index] = null;
          cascadedTagInstances.set(tagName, t);
        } else {
          if (tag.ref.parentNode) {
            tag.ref.parentNode.removeChild(tag.ref);
          }
        }
      }
    }
  };
  if (isServer) {
    actions.addServerTag = tagDesc => {
      const {
        tags = []
      } = props;
      // tweak only cascading tags
      if (cascadingTags.indexOf(tagDesc.tag) !== -1) {
        const index = tags.findIndex(prev => {
          const prevName = prev.props.name || prev.props.property;
          const nextName = tagDesc.props.name || tagDesc.props.property;
          return prev.tag === tagDesc.tag && prevName === nextName;
        });
        if (index !== -1) {
          tags.splice(index, 1);
        }
      }
      tags.push(tagDesc);
    };
    if (Array.isArray(props.tags) === false) {
      throw Error("tags array should be passed to <MetaProvider /> in node");
    }
  }
  return createComponent$1(MetaContext.Provider, {
    value: actions,
    get children() {
      return props.children;
    }
  });
};
const MetaTag = (tag, props) => {
  const id = createUniqueId();
  const c = useContext(MetaContext);
  if (!c) throw new Error("<MetaProvider /> should be in the tree");
  useHead({
    tag,
    props,
    id,
    get name() {
      return props.name || props.property;
    }
  });
  return null;
};
function useHead(tagDesc) {
  const {
    addClientTag,
    removeClientTag,
    addServerTag
  } = useContext(MetaContext);
  createRenderEffect(() => {
    if (!isServer) {
      let index = addClientTag(tagDesc);
      onCleanup(() => removeClientTag(tagDesc, index));
    }
  });
  if (isServer) {
    addServerTag(tagDesc);
    return null;
  }
}
function renderTags(tags) {
  return tags.map(tag => {
    const keys = Object.keys(tag.props);
    const props = keys.map(k => k === "children" ? "" : ` ${k}="${tag.props[k]}"`).join("");
    return tag.props.children ? `<${tag.tag} data-sm="${tag.id}"${props}>${
    // Tags might contain multiple text children:
    //   <Title>example - {myCompany}</Title>
    Array.isArray(tag.props.children) ? tag.props.children.join("") : tag.props.children}</${tag.tag}>` : `<${tag.tag} data-sm="${tag.id}"${props}/>`;
  }).join("");
}
const Title = props => MetaTag("title", props);

function RouteWrapper(Comp) {
  return () => {
    const routeData = useRouteData();
    const props = createMemo(() => routeData());
    return createComponent$1(Show, {
      get when() {
        return props();
      },
      keyed: true,
      get children() {
        return createComponent$1(Comp, mergeProps(props));
      }
    });
  };
}

var styles = {"title":"Home-module_title__udMBA","container":"Home-module_container__5j5CX","container_inner":"Home-module_container_inner__tXFEO","post":"Home-module_post__eGNu2","post_title":"Home-module_post_title__y7Hbj","post_description":"Home-module_post_description__v1aos","post_img":"Home-module_post_img__WubwV","post_bottom":"Home-module_post_bottom__zK-El"};

const _tmpl$$3 = ["<button", ">Add New</button>"],
  _tmpl$2$1 = ["<div", "><!--#-->", "<!--/--><div", ">", "</div><div style=\"", "\">", "</div></div>"],
  _tmpl$3$1 = ["<div", "><img", " src=\"/placeholder.jpg\"><div", "><h1", ">", "</h1><p", ">", "</p></div></div>"];
function Home(props) {
  return ssr(_tmpl$2$1, ssrHydrationKey() + ssrAttribute("class", escape(styles.container, true), false), escape(createComponent$1(Title, {
    children: "Home Page"
  })), ssrAttribute("class", escape(styles.container_inner, true), false), escape(createComponent$1(For, {
    each: props,
    children: item => ssr(_tmpl$3$1, ssrHydrationKey() + ssrAttribute("class", escape(styles.post, true), false), ssrAttribute("class", escape(styles.post_img, true), false), ssrAttribute("class", escape(styles.post_bottom, true), false), ssrAttribute("class", escape(styles.post_title, true), false), escape(item.title), ssrAttribute("class", escape(styles.post_description, true), false), escape(item.description))
  })), "margin:" + "4rem 0", escape(createComponent$1(Link, {
    href: "/add",
    get children() {
      return ssr(_tmpl$$3, ssrHydrationKey());
    }
  })));
}
var Home$1 = RouteWrapper(Home);

var Home$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    default: Home$1
});

const _tmpl$$2 = ["<div", "><!--#-->", "<!--/--><h1>", "</h1><p>", "</p><p>", "</p><!--#-->", "<!--/--></div>"];
function Post$1(p) {
  return ssr(_tmpl$$2, ssrHydrationKey(), escape(createComponent$1(Title, {
    get children() {
      return ["Post - ", p.title];
    }
  })), escape(p.title), escape(p.description), p.html, escape(createComponent$1(Link, {
    href: "/",
    children: "Back"
  })));
}
var Post$2 = RouteWrapper(Post$1);

var Post$3 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    default: Post$2
});

const _tmpl$$1 = ["<div", "><div class=\"field-row-stacked\" style=\"width: 200px\"><label for=\"text18\">Id</label><input", " id=\"text18\" type=\"text\"></div><div class=\"field-row-stacked\" style=\"width: 200px\"><label for=\"text18\">Title</label><input", " id=\"text18\" type=\"text\"></div><div class=\"field-row-stacked\" style=\"width: 200px\"><label for=\"text19\">Description</label><input", " id=\"text19\" type=\"text\"></div><div class=\"field-row-stacked\" style=\"width: 200px\"><label for=\"text20\">HTML</label><textarea", " id=\"text20\" rows=\"8\"></textarea></div><button style=\"", "\">Submit</button><div>", "</div></div>"];
function Add$1() {
  const [id, setId] = createSignal("");
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [html, setHtml] = createSignal("");
  useNavigate();
  useHydration();
  return ssr(_tmpl$$1, ssrHydrationKey(), ssrAttribute("value", escape(id(), true), false), ssrAttribute("value", escape(title(), true), false), ssrAttribute("value", escape(description(), true), false), ssrAttribute("value", escape(html(), true), false), "margin:" + "2rem 0", escape(createComponent$1(Link, {
    href: "/",
    children: "Back"
  })));
}

var Add$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    default: Add$1
});

const _tmpl$ = ["<head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><link rel=\"stylesheet\" href=\"/js/css/styles-v1.css\">", "", "</head>"],
  _tmpl$2 = ["<script", " id=\"SSR_DATA\" type=\"application/json\">", "</script>"],
  _tmpl$3 = ["<script", " type=\"module\" src=\"/js/index-v1.js\" async></script>"],
  _tmpl$4 = ["<html", " lang=\"en\">", "<body><div id=\"app\">", "</div></body><!--#-->", "<!--/--></html>"];
/**
 * Checking isServer to prevent code splitting on the server, not needed unless you have large or a ton of routes
 */
const HomePage = isServer ? Home$1 : lazy(() => Promise.resolve().then(function () { return Home$2; }));
const PostPage = isServer ? Post$2 : lazy(() => Promise.resolve().then(function () { return Post$3; }));
const AddPage = isServer ? Add$1 : lazy(() => Promise.resolve().then(function () { return Add$2; }));
function Entrypoint() {
  const ctx = useHydration();
  const tags = [];
  const App = createComponent$1(MetaProvider, {
    tags: tags,
    get children() {
      return createComponent$1(Router, {
        get url() {
          return ctx.hydratedData.url;
        },
        get children() {
          return createComponent$1(Suspense, {
            get children() {
              return createComponent$1(Routes, {
                get children() {
                  return [createComponent$1(Route, {
                    path: "/",
                    data: HomeData,
                    component: HomePage
                  }), createComponent$1(Route, {
                    path: "/add",
                    component: AddPage
                  }), createComponent$1(Route, {
                    path: "/post/:id",
                    data: PostData,
                    component: PostPage
                  })];
                }
              });
            }
          });
        }
      });
    }
  });
  return ssr(_tmpl$4, ssrHydrationKey(), createComponent$1(NoHydration, {
    get children() {
      return ssr(_tmpl$, escape(createComponent$1(Assets, {
        get children() {
          return renderTags(tags);
        }
      })), escape(createComponent$1(HydrationScript, {})));
    }
  }), escape(App), escape(createComponent$1(NoHydration, {
    get children() {
      return [ssr(_tmpl$2, ssrHydrationKey(), escape(JSON.stringify(ctx.hydratedData))), ssr(_tmpl$3, ssrHydrationKey())];
    }
  })));
}
function EntrypointWrapper(p) {
  return createComponent$1(HydrationProvider, {
    get props() {
      return p.props;
    },
    get url() {
      return p.url;
    },
    get children() {
      return createComponent$1(Entrypoint, {});
    }
  });
}

async function fetchPosts() {
  console.log("!!! FETCHING POSTS !!!");
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${GRAPHCMS_API_KEY}`);
  myHeaders.append("Content-Type", "application/json");
  const graphql = JSON.stringify({
    query: `
query QueryPosts {
  posts {
    title
    postId
    html
    description
  }
}
`,
    variables: {}
  });
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: graphql,
    redirect: 'follow',
    cf: {
      cacheEverything: false,
      cacheTtl: 0
    }
  };
  try {
    const Response = await fetch(GRAPHCMS_CONTENT_ENDPOINT, requestOptions);
    const Json = await Response.json();
    if (Json && Json.data && Json.data.posts) {
      return Json.data.posts;
    }
    return [];
  } catch (err) {
    return [];
  }
}

// export const EDGE_CACHE_TTL = 5
const BROWSER_CACHE_TTL = 0;

const INDEX_API_RESPONSE_CACHE_KEY = "/?api_response";
async function IndexPage(request, event) {
  const CachedResult = await CACHE_KV.get(INDEX_API_RESPONSE_CACHE_KEY);
  const URI = new URL(request.url);
  const API_RESPONSE = CachedResult && JSON.parse(CachedResult) || (await fetchPosts());
  if (!CachedResult) {
    event.waitUntil(CACHE_KV.put(INDEX_API_RESPONSE_CACHE_KEY, JSON.stringify(API_RESPONSE)));
  }
  const Props = {
    props: API_RESPONSE.map(i => ({
      id: i.postId,
      html: i.html,
      title: i.title,
      description: i.description
    }))
  };
  if (URI.pathname == "/index.props.json") {
    console.log(`Responded with home page props`);
    return new Response(JSON.stringify(Props), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `no-cache, no-store, max-age=${BROWSER_CACHE_TTL}, must-revalidate`,
        "X-Cf-Kv-Cache-Status": CachedResult ? "HIT" : "MISS"
      },
      status: 200
    });
  }
  const html = await renderToStringAsync(() => createComponent$1(EntrypointWrapper, {
    url: "/",
    props: Props
  }));
  console.log(`Responded with home page html page`);
  return new Response(`<!DOCTYPE html>` + html, {
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": `no-cache, no-store, max-age=${BROWSER_CACHE_TTL}, must-revalidate`,
      "X-Cf-Kv-Cache-Status": CachedResult ? "HIT" : "MISS"
    },
    status: 200
  });
}

async function fetchPostById(id) {
  console.log("!!! FETCHING POST BY ID !!!");
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${GRAPHCMS_API_KEY}`);
  myHeaders.append("Content-Type", "application/json");
  const graphql = JSON.stringify({
    query: `
query QueryPosts($id: String) {
  post:apiPosts(where: {postId: $id}) {
    id
    html
    description
    postId
    title
  }
}
`,
    variables: {
      id
    }
  });
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: graphql,
    redirect: 'follow',
    cf: {
      cacheEverything: false,
      cacheTtl: 0
    }
  };
  try {
    const Response = await fetch(GRAPHCMS_CONTENT_ENDPOINT, requestOptions);
    const Json = await Response.json();
    if (Json && Json.data && Json.data.post) {
      return Json.data.post;
    }
    return null;
  } catch (err) {
    return null;
  }
}

const POST_API_RESPONSE_CACHE_KEY = uuid => `/post/${uuid}?api_response`;
async function Post(request, event) {
  if (request.params == null || !request.params.id) return new Response("No post id param received!", {
    status: 400
  });
  const IsPropsNavigate = request.params.id.endsWith(".props.json");
  if (IsPropsNavigate) request.params.id = request.params.id.slice(0, request.params.id.length - ".props.json".length);
  const ID = request.params.id;
  if (ID.length < 1) return new Response(null, {
    status: 400
  });
  const CACHE_KEY = POST_API_RESPONSE_CACHE_KEY(ID);
  const CachedResult = await CACHE_KV.get(CACHE_KEY);
  const Post = CachedResult && JSON.parse(CachedResult) || (await fetchPostById(ID));
  if (!Post) return new Response(null, {
    status: 404
  });
  if (!CachedResult) {
    event.waitUntil(CACHE_KV.put(CACHE_KEY, JSON.stringify(Post)));
  }
  const Props = {
    props: Post
  };
  if (IsPropsNavigate) {
    console.log(`Responded to ${ID} post props`);
    return new Response(JSON.stringify(Props), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `no-cache, no-store, max-age=${BROWSER_CACHE_TTL}, must-revalidate`,
        "X-Cf-Kv-Cache-Status": CachedResult ? "HIT" : "MISS"
      }
    });
  }
  const html = await renderToStringAsync(() => createComponent$1(EntrypointWrapper, {
    props: Props,
    url: `/post/${ID}`
  }));
  console.log(`Responded to ${ID} html page`);
  return new Response(`<!DOCTYPE html>` + html, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": `no-cache, no-store, max-age=${BROWSER_CACHE_TTL}, must-revalidate`,
      "X-Cf-Kv-Cache-Status": CachedResult ? "HIT" : "MISS"
    }
  });
}

async function Add(request) {
  const html = await renderToStringAsync(() => createComponent$1(EntrypointWrapper, {
    url: "/add",
    props: {}
  }));
  console.log(`Responded to add html page`);
  return new Response(`<!DOCTYPE html>` + html, {
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "max-age: 120"
    },
    status: 200
  });
}

async function Invalidate(request, event) {
  const Payload = await request.json();
  const ID = Payload.data.postId;
  console.log(ID);
  event.waitUntil(Promise.all([CACHE_KV.delete(INDEX_API_RESPONSE_CACHE_KEY), CACHE_KV.delete(POST_API_RESPONSE_CACHE_KEY(ID))]));
  return new Response(null, {
    status: 200
  });
}

const router = e();
router.get("/$", IndexPage).get("/index.props.json", IndexPage);
router.get("/post/:id", Post);
router.get("/add", Add);
router.post("/api/invalidate", Invalidate);
router.get("*", () => {
  return new Response("404 Not found", {
    status: 404
  });
});
addEventListener("fetch", event => {
  event.respondWith(router.handle(event.request, event));
});
