import {db} from "../../database/db";
import {createMiddleware} from "hono/factory";
import type {Env} from "../Env.type";

export const dbMiddleware = createMiddleware<Env>(async (c, next) => {
    c.set('database', db)
    await next();
});