// Type definitions for koa-trust-proxy
import {Context, Next} from "koa";

type returnFunction = (ctx: Context, next: Next) => Promise<void>;

export default function koaTrustProxy(trustlist?: string | Array<string>, trustheader?: string): returnFunction;
