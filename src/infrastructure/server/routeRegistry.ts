import { sql } from 'drizzle-orm';
import { Hono } from 'hono';
import eNabavkiRoutes from '../../modules/eNabavki/routes/index.js';
import type { Env } from './Env.type.js';

const routeRegistry = new Hono<Env>().basePath('/api');

routeRegistry.get('/ping', (c) => {
    return c.json(
        {
            message: 'pong',
        },
        200,
    );
});

routeRegistry.get('/ready', async (c) => {
    const db = c.get('database');

    try {
        await db.execute(sql`select 1`);

        return c.json(
            {
                message: 'Ready',
            },
            200,
        );
    } catch {
        return c.json(
            {
                message: 'Not ready',
            },
            503,
        );
    }
});

routeRegistry.get('/.well-known', (c) => {
    return c.json(
        {
            endpoints: [
                { method: 'GET', path: '/api/.well-known' },
                { method: 'GET', path: '/api/ping' },
                { method: 'GET', path: '/api/ready' },
                {
                    contracts: [
                        {
                            method: 'GET',
                            path: '/api/contracts/awarded-contracts',
                        },
                        {
                            method: 'GET',
                            path: '/api/contracts/awarded-contracts/:id',
                        },
                        {
                            method: 'GET',
                            path: '/api/contracts/awarded-contracts/:id/changes',
                        },
                        {
                            method: 'GET',
                            path: '/api/contracts/realised-contracts',
                        },
                        {
                            method: 'GET',
                            path: '/api/contracts/realised-contracts/:id',
                        },
                        {
                            method: 'GET',
                            path: '/api/contracts/institutions',
                        },
                        {
                            method: 'GET',
                            path: '/api/contracts/institutions/:id',
                        },
                        {
                            method: 'GET',
                            path: '/api/contracts/institutions/:id/awarded-contracts',
                        },
                        {
                            method: 'GET',
                            path: '/api/contracts/institutions/:id/realised-contracts',
                        },
                    ],
                },
            ],
        },
        200,
    );
});

routeRegistry.route('', eNabavkiRoutes);

export default routeRegistry;
