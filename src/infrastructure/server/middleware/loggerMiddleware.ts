import { createMiddleware } from 'hono/factory';
import { logger } from '../../logging/logger.js';
import type { Env } from '../Env.type.js';

export const loggerMiddleware = createMiddleware<Env>(async (c, next) => {
    const start = Date.now();
    const method = c.req.method;
    const path = c.req.path;
    const requestId = c.get('requestId');

    logger.debug(
        `[Server]:[HTTP-REQUEST] [${requestId}] <-- ${method} ${path}`,
    );

    await next();

    const durationMs = Date.now() - start;
    const status = c.res.status;

    logger.debug(
        `[Server]:[HTTP-RESPONSE] [${requestId}] --> ${status} ${method} ${path} (${durationMs}ms)`,
    );
});
