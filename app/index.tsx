import {hydrate} from "solid-js/web";
import Entrypoint from "./src/Document";


hydrate(() =>
        <Entrypoint url={location.pathname} props={{}}/>
    , document);
