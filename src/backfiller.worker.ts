import 'dotenv/config';
import { logger } from './infrastructure/logging/logger.js';
import { backfillData } from './infrastructure/workers/backfilling/backfiller.js';

logger.info('[Backfiller] Worker runtime initialised.');

await backfillData();
