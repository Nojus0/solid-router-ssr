import {hydrate} from "solid-js/web";
import Entrypoint from "./Document";
import "../styles/styles-v1.css"

hydrate(() =>
        <Entrypoint url={location.pathname} props={{}}/>
    , document);
