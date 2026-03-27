import type { RequestIdVariables } from 'hono/request-id';
import type { DbOrTx } from '../../shared/types/Database.type.js';

export type Env = {
    Variables: {
        database: DbOrTx;
        requestId: RequestIdVariables['requestId'];
    };
};
