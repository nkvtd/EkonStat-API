import 'dotenv/config';
import { logger } from './infrastructure/logging/logger.js';
import { registerWebhooks } from './infrastructure/webhooks/webhookDispatcher.js';
import { scheduleJobs } from './infrastructure/workers/scheduling/scheduler.js';

logger.info('[Scheduler] Worker runtime initialised.');

registerWebhooks();

await scheduleJobs();
