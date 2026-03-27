import "dotenv/config";
import {runJobs, scheduleJobs} from "./infrastructure/scheduling/scheduler";
import {logger} from "./infrastructure/logging/logger";
import app from "./infrastructure/server/server"
import {serve} from "@hono/node-server";
import {registerWebhooks} from "./infrastructure/webhooks/webhookDispatcher";

try {
    logger.info('Starting EkonStat-API');
    
    serve({
        fetch: app.fetch,
        port: process.env.PORT ? parseInt(process.env.PORT, 10) : 80
    }, (info) => {
        logger.info(`Server listening on ${info.address}:${info.port}`);
    })
    
    await registerWebhooks();
    await scheduleJobs();
    await runJobs();
} catch (error: any) {
    logger.error(`Application failed to start: ${error.message}`, { stack: error.stack });
}