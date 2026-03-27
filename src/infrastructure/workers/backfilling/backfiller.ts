import { db } from '../../database/db.js';
import { logger } from '../../logging/logger.js';
import { jobs } from './backfillRegistry.js';

export async function backfillData() {
    logger.info(`[Backfiller] Backfilling started with ${jobs.length} jobs.`);

    for (const job of jobs) {
        try {
            const start = Date.now();

            logger.info(
                `[Backfiller]:[${job.module}.${job.name}] Job execution started`,
            );

            await job.task(db);

            logger.info(
                `[Backfiller]:[${job.module}.${job.name}] Job execution completed in ${Date.now() - start} ms.`,
            );
        } catch (error) {
            logger.error(
                `[Backfiller]:[${job.module}.${job.name}] Job execution failed:`,
                error,
            );
        }
    }
}
