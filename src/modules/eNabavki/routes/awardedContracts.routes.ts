import { Hono } from 'hono';
import type { Env } from '../../../infrastructure/server/Env.type.js';
import { zValidator } from '../../../infrastructure/server/validation/customValidator.js';
import { idParamSchema } from '../../../shared/validation/Id.schema.js';
import { paginationSchema } from '../../../shared/validation/Pagination.schema.js';
import {
    toAwardedContractDTO,
    toAwardedContractDTOList,
} from '../data/dto/AwardedContract.dto.js';
import { toChangesInAwardedContractDTOList } from '../data/dto/ChangesInAwardedContract.dto.js';
import {
    getActiveAwardedContracts,
    getAwardedContractById,
} from '../data/queries/awardedContracts.query.js';
import { getChangesForAwardedContractById } from '../data/queries/changesInAwardedContracts.query.js';
import { awardedContractsQuerySchema } from './validation/awardedContracts.schema.js';

const awardedContractsRoutes = new Hono<Env>();

awardedContractsRoutes.get(
    '/',
    zValidator('query', awardedContractsQuerySchema),
    async (c) => {
        const db = c.get('database');
        const query = c.req.valid('query');

        const contracts = await getActiveAwardedContracts(db, query);

        const nextCursor =
            contracts.length === query.pageSize
                ? contracts[contracts.length - 1]?.id
                : null;

        return c.json(
            {
                data: toAwardedContractDTOList(contracts),
                meta: {
                    nextCursor,
                    pageSize: query.pageSize,
                    hasMore: nextCursor !== null,
                },
            },
            200,
        );
    },
);

awardedContractsRoutes.get(
    '/:id',
    zValidator('param', idParamSchema),
    async (c) => {
        const db = c.get('database');
        const id = c.req.valid('param').id;

        const contract = await getAwardedContractById(db, id);

        if (!contract) {
            return c.json(
                {
                    message: 'Specified contract id not found',
                },
                404,
            );
        }

        return c.json(
            {
                data: toAwardedContractDTO(contract),
            },
            200,
        );
    },
);

awardedContractsRoutes.get(
    '/:id/changes',
    zValidator('param', idParamSchema),
    zValidator('query', paginationSchema),
    async (c) => {
        const db = c.get('database');
        const id = c.req.valid('param').id;
        const query = c.req.valid('query');

        const changes = await getChangesForAwardedContractById(db, id, query);

        const nextCursor =
            changes.length === query.pageSize
                ? changes[changes.length - 1]?.id
                : null;

        return c.json(
            {
                data: toChangesInAwardedContractDTOList(changes),
                meta: {
                    nextCursor,
                    pageSize: query.pageSize,
                    hasMore: nextCursor !== null,
                },
            },
            200,
        );
    },
);

export default awardedContractsRoutes;
