import {type EVENTS_TYPE, EVENTS} from "./src/infrastructure/webhooks/events/eventRegistry";

export type WebhookConfig = Record<EVENTS_TYPE, string[]>;

export const webhooksConfig: WebhookConfig = {
    [EVENTS.NEW_REALISED_CONTRACTS]: [
        "https://discord.com/api/webhooks/1477254589018411099/F5Fwj7MUmosDVhwa8SyL_HIg4FDWOBkyO6l1fyDXwkPlZ0EkWTenJb37sUfd8txNetn6",
    ],
    [EVENTS.NEW_AWARDED_CONTRACTS]: [
        "https://discord.com/api/webhooks/1478039006087348339/r12bp-Nj06YdAJcV50YdZIC3TK0oZMhfg0aG9ZQw6o9yEKu1ARdBPEQqrLUgXW2lc-fK"
    ],
    [EVENTS.CHANGES_IN_AWARDED_CONTRACTS]: [
        "https://discord.com/api/webhooks/1478039149385748703/u5kmoY29dPSbK-N5Ra-JsmL8H5Ju7xXDmyQ84tx6nXDPUw_x_G2oI0rA-EH_E-IZufaz"
    ],
};

