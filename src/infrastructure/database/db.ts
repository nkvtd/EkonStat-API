/** biome-ignore-all lint/complexity/useLiteralKeys: <Has to be this way because of tsconfig> */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { schema } from './schemaRegistry.js';

const pool = new Pool({
    connectionString: process.env['DATABASE_URL'],
});

export const db = drizzle(pool, { schema });
