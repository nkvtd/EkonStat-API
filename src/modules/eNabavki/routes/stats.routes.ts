import { Hono } from 'hono';
import type { Env } from '../../../infrastructure/server/Env.type.js';
import { getTotalAwardedContractsCount } from '../data/queries/awardedContracts.query.js';
import { getTotalContractorsCount } from '../data/queries/contractors.query.js';
import { getTotalInstitutionsCount } from '../data/queries/institutions.query.js';
import { getTotalRealisedContractsCount } from '../data/queries/realisedContracts.query.js';

const statsRoutes = new Hono<Env>();

statsRoutes.get('/', async (c) => {
    const db = c.get('database');

    const awardedContractsCount = await getTotalAwardedContractsCount(db);
    const realisedContractsCount = await getTotalRealisedContractsCount(db);
    const totalContractsCount = awardedContractsCount + realisedContractsCount;

    const institutionsCount = await getTotalInstitutionsCount(db);
    const contractorsCount = await getTotalContractorsCount(db);

    return c.json({
        awardedContractsCount,
        realisedContractsCount,
        totalContractsCount,
        institutionsCount,
        contractorsCount,
    });
});

export default statsRoutes;
