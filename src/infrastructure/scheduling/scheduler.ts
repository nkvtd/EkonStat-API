import {jobs} from "./schedulerRegistry";
import {logger} from "../logging/logger";  
import {db} from "../database/db";
import {Cron} from "croner";
import cronstrue from 'cronstrue';
import queue from "./queue";

export async function scheduleJobs() {
    logger.debug(`Scheduling ${jobs.length} jobs`);
    
    for (const job of jobs) {
        new Cron(job.schedule, {
            name: job.name,
            timezone: "Europe/Skopje",
            protect: true
        }, async () => {
            queue.add(async () => {
                const start = Date.now();
                
                logger.info(`Starting scheduled job ${job.name} @ ${job.module}`);
                
                await job.task(db);

                logger.debug(`Scheduled job ${job.name} @ ${job.module} completed in ${Date.now() - start}ms.`);
            }).catch((error) => {
                logger.error(`Scheduled job ${job.name} @ ${job.module} failed: ${error.message}`, { stack: error.stack });
            });
        });

        logger.info(`Scheduled job ${job.name} @ ${job.module} to run ${cronstrue.toString(job.schedule, { use24HourTimeFormat: true }).toLowerCase()}`);
    }
}

export async function runJobs() {
    for (const job of jobs) {
        queue.add(async () => {
            const start = Date.now();

            logger.info(`Starting job ${job.name} @ ${job.module}`);

            await job.task(db);

            logger.debug(`Job ${job.name} @ ${job.module} completed in ${Date.now() - start}ms`);;
        }).catch((error: any) => {
            logger.error(`Job ${job.name} @ ${job.module} failed: ${error.message}`, { stack: error.stack });
        });
    }
}