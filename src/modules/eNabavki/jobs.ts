import type { DbOrTx } from '../../shared/types/Database.type.js';
import type { Job } from '../../shared/types/Job.type.js';
import { ENABAVKI_EVENTS } from './data/events.js';
import { runScraper } from './scraping/scraperRunner.js';
import { awardedContractsStrategy } from './scraping/strategies/awardedContractsStrategy.js';
import { changesInAwardedContractsStrategy } from './scraping/strategies/changesInAwardedContractsStrategy.js';
import { realisedContractsStrategy } from './scraping/strategies/realisedContractsStrategy.js';

export const scheduledJobs: Job[] = [
    {
        module: 'eNabavki',
        name: 'awarded-contracts-processing',
        schedule: '0 * * * *',
        event: ENABAVKI_EVENTS.NEW_AWARDED_CONTRACTS,
        task: async (db: DbOrTx) =>
            runScraper(
                db,
                'eNabavki.awarded-contracts-processing',
                awardedContractsStrategy,
                'incremental',
            ),
    },
    {
        module: 'eNabavki',
        name: 'changes-in-contracts-processing',
        schedule: '0 */6 * * *',
        event: ENABAVKI_EVENTS.CHANGES_IN_AWARDED_CONTRACTS,
        task: async (db: DbOrTx) =>
            runScraper(
                db,
                'eNabavki.changes-in-contracts-processing',
                changesInAwardedContractsStrategy,
                'incremental',
            ),
    },
    {
        module: 'eNabavki',
        name: 'realised-contracts-processing',
        schedule: '0 * * * *',
        event: ENABAVKI_EVENTS.NEW_REALISED_CONTRACTS,
        task: async (db: DbOrTx) =>
            runScraper(
                db,
                'eNabavki.realised-contracts-processing',
                realisedContractsStrategy,
                'incremental',
            ),
    },
];

export const backfillJobs: Job[] = [
    {
        module: 'eNabavki',
        name: 'awarded-contracts-processing',
        schedule: '/',
        event: ENABAVKI_EVENTS.NEW_AWARDED_CONTRACTS,
        task: async (db: DbOrTx) =>
            runScraper(
                db,
                'eNabavki.awarded-contracts-processing',
                awardedContractsStrategy,
                'backfill',
            ),
    },
    {
        module: 'eNabavki',
        name: 'changes-in-contracts-processing',
        schedule: '/',
        event: ENABAVKI_EVENTS.CHANGES_IN_AWARDED_CONTRACTS,
        task: async (db: DbOrTx) =>
            runScraper(
                db,
                'eNabavki.changes-in-contracts-processing',
                changesInAwardedContractsStrategy,
                'backfill',
            ),
    },
    {
        module: 'eNabavki',
        name: 'realised-contracts-processing',
        schedule: '/',
        event: ENABAVKI_EVENTS.NEW_REALISED_CONTRACTS,
        task: async (db: DbOrTx) =>
            runScraper(
                db,
                'eNabavki.realised-contracts-processing',
                realisedContractsStrategy,
                'backfill',
            ),
    },
];
