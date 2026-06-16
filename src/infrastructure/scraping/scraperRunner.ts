import type { DbOrTx } from '../../shared/types/Database.type.js';
import type { ScrapingStrategy } from '../../shared/types/Strategy.type.js';
import { getCurrentDateISO } from '../../shared/util/dates.js';
import { logger } from '../logging/logger.js';
import { ScrapingClient } from './scrapingClient.js';

export async function runScraper<TInsert, TItem, TDto>(
    db: DbOrTx,
    jobLabel: string,
    strategy: ScrapingStrategy<TInsert, TItem, TDto>,
    mode: 'incremental' | 'backfill',
) {
    const currentDateISO = getCurrentDateISO();
    const maxPages = mode === 'backfill' ? Infinity : 1;
    const batchSize = mode === 'backfill' ? 1000 : 50;

    let currentStart = 0;
    let currentDraw = 1;
    let pagesFetched = 0;

    const allNewItems: TItem[] = [];

    const scrapingClient = new ScrapingClient(
        strategy.meta.referer,
        strategy.meta.origin,
    );
    await scrapingClient.init();

    while (pagesFetched < maxPages) {
        const payload = strategy.buildPayload({
            start: currentStart,
            length: batchSize,
            draw: currentDraw,
        });

        const response = await scrapingClient.scrape(
            strategy.meta.method,
            strategy.url,
            payload,
        );
        const data = strategy.parseResponse(response, currentDateISO);
        const newItems = await strategy.insertData(db, data);

        if (newItems.length === 0) break;

        allNewItems.push(...newItems);

        if (data.length < batchSize) break;

        if (mode === 'incremental') {
            logger.debug(
                `[Scheduler]:[${jobLabel}] Total new items processed: ${allNewItems.length}`,
            );
        } else {
            logger.debug(
                `[Backfiller]:[${jobLabel}] New items processed in batch ${currentDraw}: ${newItems.length}`,
            );
            logger.debug(
                `[Backfiller]:[${jobLabel}] Total new items processed: ${allNewItems.length}`,
            );
        }

        currentStart += batchSize;
        currentDraw++;
        pagesFetched++;
    }

    const dto = strategy.mapToDTO(allNewItems);

    return dto;
}
