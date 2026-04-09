import { Cron } from 'croner';
import cronstrue from 'cronstrue';
import { db } from '../../database/db.js';
import { logger } from '../../logging/logger.js';
import eventBus from '../../webhooks/events/eventBus.js';
import queue from './queue.js';
import { jobs } from './schedulerRegistry.js';

export async function scheduleJobs() {
    logger.info(`[Scheduler] Scheduling ${jobs.length} jobs.`);

    for (const job of jobs) {
        new Cron(
            job.schedule,
            {
                name: job.name,
                timezone: 'Europe/Skopje',
                protect: true,
            },
            async () => {
                queue.add(async () => {
                    const start = Date.now();

                    logger.info(
                        `[Scheduler]:[${job.module}.${job.name}] Job execution started`,
                    );

                    try {
                        const data = await job.task(db);

                        if (data.length === 0) {
                            logger.debug(
                                `[Scheduler]:[${job.module}.${job.name}] Job execution completed with no new data in ${Date.now() - start} ms`,
                            );
                        } else {
                            eventBus.emit(job.event, data);

                            logger.debug(
                                `[Scheduler]:[${job.module}.${job.name}] Job execution completed with new data (${data.length} items) in ${Date.now() - start} ms`,
                            );
                        }
                    } catch (error) {
                        logger.error(
                            `[Scheduler]:[${job.module}.${job.name}] Job execution failed:`,
                            error,
                        );
                    }
                });
            },
        );

        logger.info(
            `[Scheduler]:[${job.module}.${job.name}] Job registered to run ${cronstrue.toString(job.schedule, { use24HourTimeFormat: true }).toLowerCase()} (${job.schedule}).`,
        );
    }

    logger.info(`[Scheduler] All ${jobs.length} jobs have been scheduled.`);
}
