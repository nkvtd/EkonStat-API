import { Hono } from 'hono';
import type { Env } from '../../../infrastructure/server/Env.type.js';
import { zValidator } from '../../../infrastructure/server/validation/customValidator.js';
import { idParamSchema } from '../../../shared/validation/Id.schema.js';
import { paginationQuerySchema } from '../../../shared/validation/PaginationQuery.schema.js';
import { toAwardedContractDTOList } from '../data/dto/AwardedContract.dto.js';
import {
    toContractorDTO,
    toContractorDTOList,
} from '../data/dto/Contractor.dto.js';
import { toRealisedContractDTOList } from '../data/dto/RealisedContract.dto.js';
import {
    getAwardedContractsForContractorById,
    getContractorById,
    getContractors,
    getRealisedContractsForContractorById,
} from '../data/queries/contractors.query.js';
import { contractorsQuerySchema } from './validation/contractors.schema.js';

const contractorsRoutes = new Hono<Env>();

contractorsRoutes.get(
    '/',
    zValidator('query', contractorsQuerySchema),
    async (c) => {
        const db = c.get('database');
        const query = c.req.valid('query');

        const result = await getContractors(db, query);

        if (result.invalidCursor) {
            return c.json(
                {
                    message: 'Invalid cursor',
                },
                400,
            );
        }

        return c.json(
            {
                data: toContractorDTOList(result.data),
                meta: {
                    nextCursor: result.nextCursor,
                    pageSize: query.pageSize,
                    hasMore: result.nextCursor !== null,
                },
            },
            200,
        );
    },
);

contractorsRoutes.get('/:id', zValidator('param', idParamSchema), async (c) => {
    const db = c.get('database');
    const id = c.req.valid('param').id;

    const contractor = await getContractorById(db, id);

    if (!contractor) {
        return c.json(
            {
                message: 'Specified contractor id not found',
            },
            404,
        );
    }

    return c.json(
        {
            data: toContractorDTO(contractor),
        },
        200,
    );
});

contractorsRoutes.get(
    '/:id/awarded',
    zValidator('param', idParamSchema),
    zValidator('query', paginationQuerySchema),
    async (c) => {
        const db = c.get('database');
        const id = c.req.valid('param').id;
        const query = c.req.valid('query');

        const contracts = await getAwardedContractsForContractorById(
            db,
            id,
            query,
        );

        if (contracts.invalidCursor) {
            return c.json(
                {
                    message: 'Invalid cursor',
                },
                400,
            );
        }

        return c.json(
            {
                data: toAwardedContractDTOList(contracts.data),
                meta: {
                    nextCursor: contracts.nextCursor,
                    pageSize: query.pageSize,
                    hasMore: contracts.nextCursor !== null,
                },
            },
            200,
        );
    },
);

contractorsRoutes.get(
    '/:id/realised',
    zValidator('param', idParamSchema),
    zValidator('query', paginationQuerySchema),
    async (c) => {
        const db = c.get('database');
        const id = c.req.valid('param').id;
        const query = c.req.valid('query');

        const contracts = await getRealisedContractsForContractorById(
            db,
            id,
            query,
        );

        if (contracts.invalidCursor) {
            return c.json(
                {
                    message: 'Invalid cursor',
                },
                400,
            );
        }

        return c.json(
            {
                data: toRealisedContractDTOList(contracts.data),
                meta: {
                    nextCursor: contracts.nextCursor,
                    pageSize: query.pageSize,
                    hasMore: contracts.nextCursor !== null,
                },
            },
            200,
        );
    },
);

export default contractorsRoutes;
