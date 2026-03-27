import {ENABAVKI_EVENTS} from "../../../modules/eNabavki/data/events";

export const EVENTS = {
    ...ENABAVKI_EVENTS,
};

export type EVENTS_TYPE = typeof EVENTS[keyof typeof EVENTS];