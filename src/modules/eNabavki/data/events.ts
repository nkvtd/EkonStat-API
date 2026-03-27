export const ENABAVKI_EVENTS = {
    NEW_REALISED_CONTRACTS: 'new-realised-contracts',
    NEW_AWARDED_CONTRACTS: 'new-awarded-contracts',
    CHANGES_IN_AWARDED_CONTRACTS: 'changes-in-awarded-contracts',
} as const;

export type ENABAVKI_EVENTS_TYPE = typeof ENABAVKI_EVENTS[keyof typeof ENABAVKI_EVENTS];
