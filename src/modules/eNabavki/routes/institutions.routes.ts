import { Hono } from 'hono';
import type { Env } from '../../../infrastructure/server/Env.type.js';
import { zValidator } from '../../../infrastructure/server/validation/customValidator.js';
import { idParamSchema } from '../../../shared/validation/Id.schema.js';
import { paginationQuerySchema } from '../../../shared/validation/PaginationQuery.schema.js';
import { toAwardedContractDTOList } from '../data/dto/AwardedContract.dto.js';
import {
    toInstitutionDTO,
    toInstitutionDTOList,
} from '../data/dto/Institution.dto.js';
import { toRealisedContractDTOList } from '../data/dto/RealisedContract.dto.js';
import {
    getAwardedContractsForInstitutionById,
    getInstitutionById,
    getInstitutions,
    getRealisedContractsForInstitutionById,
} from '../data/queries/institutions.query.js';
import { institutionsQuerySchema } from './validation/institutions.schema.js';

const institutionsRoutes = new Hono<Env>();

institutionsRoutes.get(
    '/',
    zValidator('query', institutionsQuerySchema),
    async (c) => {
        const db = c.get('database');
        const query = c.req.valid('query');

        const result = await getInstitutions(db, query);

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
                data: toInstitutionDTOList(result.data),
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

institutionsRoutes.get(
    '/:id',
    zValidator('param', idParamSchema),
    async (c) => {
        const db = c.get('database');
        const id = c.req.valid('param').id;

        const institution = await getInstitutionById(db, id);

        if (!institution) {
            return c.json(
                {
                    message: 'Specified institution id not found',
                },
                404,
            );
        }

        return c.json(
            {
                data: toInstitutionDTO(institution),
            },
            200,
        );
    },
);

institutionsRoutes.get(
    '/:id/awarded',
    zValidator('param', idParamSchema),
    zValidator('query', paginationQuerySchema),
    async (c) => {
        const db = c.get('database');
        const id = c.req.valid('param').id;
        const query = c.req.valid('query');

        const contracts = await getAwardedContractsForInstitutionById(
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

institutionsRoutes.get(
    '/:id/realised',
    zValidator('param', idParamSchema),
    zValidator('query', paginationQuerySchema),
    async (c) => {
        const db = c.get('database');
        const id = c.req.valid('param').id;
        const query = c.req.valid('query');

        const contracts = await getRealisedContractsForInstitutionById(
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

export default institutionsRoutes;
