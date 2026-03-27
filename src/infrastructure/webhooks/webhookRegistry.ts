import { EVENTS, type EVENTS_TYPE } from './events/eventRegistry.js';

export type WebhookRegistry = Record<EVENTS_TYPE, string[]>;

function getWebhooks(prefix: string): string[] {
    const urls = Object.keys(process.env)
        .filter((key) => key.startsWith(prefix))
        .map((key) => process.env[key])
        .filter((url): url is string => Boolean(url && url.length > 0))
        .map((url) => new URL(url).toString());

    return urls;
}

export const webhookRegistry = Object.fromEntries(
    Object.entries({
        [EVENTS.NEW_REALISED_CONTRACTS]: getWebhooks(
            'REALISED_CONTRACTS_WEBHOOK_',
        ),
        [EVENTS.NEW_AWARDED_CONTRACTS]: getWebhooks(
            'AWARDED_CONTRACTS_WEBHOOK_',
        ),
        [EVENTS.CHANGES_IN_AWARDED_CONTRACTS]: getWebhooks(
            'CHANGES_IN_AWARDED_CONTRACTS_WEBHOOK_',
        ),
    }).filter(([_, urls]) => urls.length > 0),
) as WebhookRegistry;
