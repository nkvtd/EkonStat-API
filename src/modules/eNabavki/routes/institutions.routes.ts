import { Hono } from 'hono';
import type { Env } from '../../../infrastructure/server/Env.type.js';
import { zValidator } from '../../../infrastructure/server/validation/customValidator.js';
import { idParamSchema } from '../../../shared/validation/Id.schema.js';
import { paginationSchema } from '../../../shared/validation/Pagination.schema.js';
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

        const institutions = await getInstitutions(db, query);

        const nextCursor =
            institutions.length === query.pageSize
                ? institutions[institutions.length - 1]?.id
                : null;

        return c.json(
            {
                data: toInstitutionDTOList(institutions),
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
    zValidator('query', paginationSchema),
    async (c) => {
        const db = c.get('database');
        const id = c.req.valid('param').id;
        const query = c.req.valid('query');

        const contracts = await getAwardedContractsForInstitutionById(
            db,
            id,
            query,
        );

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

institutionsRoutes.get(
    '/:id/realised',
    zValidator('param', idParamSchema),
    zValidator('query', paginationSchema),
    async (c) => {
        const db = c.get('database');
        const id = c.req.valid('param').id;
        const query = c.req.valid('query');

        const contracts = await getRealisedContractsForInstitutionById(
            db,
            id,
            query,
        );

        const nextCursor =
            contracts.length === query.pageSize
                ? contracts[contracts.length - 1]?.id
                : null;

        return c.json(
            {
                data: toRealisedContractDTOList(contracts),
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

export default institutionsRoutes;
