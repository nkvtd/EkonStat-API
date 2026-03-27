import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { trimTrailingSlash } from 'hono/trailing-slash';
import { rateLimiter } from 'hono-rate-limiter';
import { logger } from '../logging/logger.js';
import type { Env } from './Env.type.js';
import { dbMiddleware } from './middleware/dbMiddleware.js';
import { loggerMiddleware } from './middleware/loggerMiddleware.js';
import routeRegistry from './routeRegistry.js';

const app = new Hono<Env>();

app.use(
    '/api/*',
    cors({
        origin: '*',
        allowMethods: ['GET'],
        maxAge: 600,
    }),
);

app.use(
    '/api/*',
    requestId({
        headerName: '',
    }),
);

app.use('/api/*', loggerMiddleware);
app.use('/api/*', trimTrailingSlash());

app.use(
    '/api/*',
    rateLimiter({
        windowMs: 1 * 60 * 1000, // 1 minute
        limit: 60,
        keyGenerator: (c) =>
            c.req.header('cf-connecting-ip') ??
            c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
            'unknown',
        message: 'Too many requests, please try again later.',
    }),
);

app.use('/api/*', dbMiddleware);
app.use('/api/*', secureHeaders());

app.onError((err, c) => {
    const requestId = c.get('requestId');

    if (err instanceof HTTPException) {
        logger.warn('[Server] Request failed:', {
            requestId,
            method: c.req.method,
            path: c.req.path,
            status: err.status,
            message: err.message,
        });

        return err.getResponse();
    }

    if (err instanceof Error) {
        logger.error('[Server] Request crashed:', {
            requestId,
            method: c.req.method,
            path: c.req.path,
            errorName: err.name,
            errorMessage: err.message,
            errorStack: err.stack,
            cause: err.cause,
        });

        return c.json(
            {
                message: 'Internal server error.',
            },
            500,
        );
    }

    logger.error('[Server] Request crashed:', {
        requestId,
        method: c.req.method,
        path: c.req.path,
        thrown: err,
    });

    return c.json(
        {
            message: 'Internal server error.',
        },
        500,
    );
});

app.notFound((c) => {
    return c.json(
        {
            message: 'Route not found',
        },
        404,
    );
});

app.route('', routeRegistry);

export default app;
