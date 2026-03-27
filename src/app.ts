/** biome-ignore-all lint/complexity/useLiteralKeys: <Has to be this way because of tsconfig> */
import 'dotenv/config';
import { serve } from '@hono/node-server';
import { logger } from './infrastructure/logging/logger.js';
import app from './infrastructure/server/server.js';

logger.info('[Server] Starting...');

const server = serve(
    {
        fetch: app.fetch,
        port: process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 8080,
    },
    (info) => {
        logger.info(`[Server] Running on port ${info.port}.`);
    },
);

server.on('error', (error: NodeJS.ErrnoException) => {
    logger.error('[Server] Startup failed:', error);
});
