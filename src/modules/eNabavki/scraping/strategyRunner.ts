import type {ScrapingStrategy} from "./strategies/Strategy.type";
import {scrape} from "./scrapingClient";
import eventBus from "../../../infrastructure/webhooks/events/eventBus";
import {logger} from "../../../infrastructure/logging/logger";
import {getCurrentDateISO} from "../util/dates";
import type {DbOrTx} from "../../../shared/types/Database.type";

export async function runStrategy<TInsert, TItem, TDto>(db: DbOrTx, strategy: ScrapingStrategy<TInsert, TItem, TDto>) {
    try {
        const currentDateISO = getCurrentDateISO();
        
        const payload = strategy.buildPayload();
        
        const response = await scrape(strategy.url, payload);
        const data = strategy.parseResponse(response, currentDateISO);
        
        const newItems = await strategy.insertData(db, data);

        if (newItems.length > 0) {
            const dto = strategy.toDTO(newItems);
            logger.debug(`Emitting ${strategy.event} event with ${dto.length} items`);

            eventBus.emit(strategy.event, dto);
        }

        logger.info(`Found ${newItems.length} new items after running ${strategy.name}`);
    } catch (error: any) {
        logger.error(`Strategy ${strategy.name} failed: ${error.message}`, { stack: error.stack });
        
        throw error;
    }
}