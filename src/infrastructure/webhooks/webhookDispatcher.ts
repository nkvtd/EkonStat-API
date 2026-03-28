import axios from 'axios';
import pMap from 'p-map';
import { logger } from '../logging/logger.js';
import eventBus from './events/eventBus.js';
import { webhookRegistry } from './webhookRegistry.js';

export function registerWebhooks<TDto>() {
    for (const [event, urls] of Object.entries(webhookRegistry)) {
        logger.info(
            `[Scheduler]:[Webhook] Registering ${urls.length} webhook(s) for event ${event}.`,
        );

        eventBus.on(event, async (payload: TDto[]) => {
            logger.debug(
                `[Scheduler]:[Webhook] Dispatching to ${urls.length} webhook(s) for event ${event}.`,
            );

            const { successCount, failCount } = await dispatchToWebhooks(
                event,
                urls,
                payload,
            );

            if (failCount === 0) {
                logger.debug(
                    `[Scheduler]:[Webhook] Dispatch for event ${event} completed successfully for all webhooks.`,
                );
            } else {
                logger.debug(
                    `[Scheduler]:[Webhook] Dispatch for event ${event} partially completed: ${successCount} succeeded, ${failCount} failed.`,
                );
            }
        });

        logger.info(
            `[Scheduler]:[Webhook] Registered ${urls.length} webhook(s) for event ${event}.`,
        );
    }
}

async function dispatchToWebhooks<TDto>(
    event: string,
    urls: string[],
    payload: TDto[],
) {
    const result = await pMap(
        urls,
        (url) => dispatchToWebhook(event, url, payload),
        {
            concurrency: 3,
        },
    );

    const successCount = result.filter(Boolean).length;
    const failCount = result.length - successCount;

    return {
        successCount,
        failCount,
    };
}

async function dispatchToWebhook<TDto>(
    event: string,
    url: string,
    payload: TDto[],
) {
    try {
        await axios.post(
            url,
            {
                data: payload,
                meta: {
                    event: event,
                    dispatchedAt: new Date().toISOString(),
                },
            },
            {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );

        return true;
    } catch {
        return false;
    }
}
