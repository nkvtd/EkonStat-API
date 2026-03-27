import type { EVENTS_TYPE } from '../../infrastructure/webhooks/events/eventRegistry.js';
import type { DbOrTx } from './Database.type.js';

export type Job = {
    module: string;
    name: string;
    schedule: string;
    event: EVENTS_TYPE;
    task: (db: DbOrTx) => Promise<unknown[]>;
};
