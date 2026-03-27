import { createMiddleware } from 'hono/factory';
import { db } from '../../database/db.js';
import type { Env } from '../Env.type.js';

export const dbMiddleware = createMiddleware<Env>(async (c, next) => {
    c.set('database', db);
    await next();
});
