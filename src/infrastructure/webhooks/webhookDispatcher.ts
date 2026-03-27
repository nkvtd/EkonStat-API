import axios from "axios";
import {logger} from "../logging/logger";
import eventBus from "./events/eventBus";
import {webhooksConfig} from "../../../webhooks.config";
import {mapEventToEmbed} from "./discordEmbed";

export async function registerWebhooks() {
    for (const [event, urls] of Object.entries(webhooksConfig)) {
        eventBus.on(event, async (payload: any) => {
            for (const item of payload) {
                await dispatchWebhook(event, urls, item);
            }

            logger.info(`Payload for event ${event} dispatched to webhooks successfully`);
        });
        logger.info(`Registered ${urls.length} webhook(s) for event ${event}`);
    }
}

async function dispatchWebhook(event: string, urls: string[], item: any) {
    const embed = mapEventToEmbed(event, item);
    
    for (const url of urls) {
        logger.debug(`Dispatching event ${event} @ webhook ${url}`)
        try {
             await axios.post(url, {
                     embeds: [embed]
                 }, {
                 headers: {
                     'Content-Type': 'application/json'
                 }
             });

        } catch (error: any) {
            logger.error(`Dispatching event ${event} @ webhook ${url} failed: ${error.message}`, { stack: error.stack });
        }
    }
}