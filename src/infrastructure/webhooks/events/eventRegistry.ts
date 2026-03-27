import { ENABAVKI_EVENTS } from '../../../modules/eNabavki/data/events.js';

export const EVENTS = {
    ...ENABAVKI_EVENTS,
};

export type EVENTS_TYPE = (typeof EVENTS)[keyof typeof EVENTS];
