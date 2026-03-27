import { Hono } from 'hono';
import type { Env } from '../../../infrastructure/server/Env.type.js';
import { zValidator } from '../../../infrastructure/server/validation/customValidator.js';
import { idParamSchema } from '../../../shared/validation/Id.schema.js';
import {
    toRealisedContractDTO,
    toRealisedContractDTOList,
} from '../data/dto/RealisedContract.dto.js';
import {
    getRealisedContractById,
    getRealisedContracts,
} from '../data/queries/realisedContracts.query.js';
import { realisedContractsQuerySchema } from './validation/realisedContracts.schema.js';

const realisedContractsRoutes = new Hono<Env>();

realisedContractsRoutes.get(
    '/',
    zValidator('query', realisedContractsQuerySchema),
    async (c) => {
        const db = c.get('database');
        const query = c.req.valid('query');

        const contracts = await getRealisedContracts(db, query);

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

realisedContractsRoutes.get(
    '/:id',
    zValidator('param', idParamSchema),
    async (c) => {
        const db = c.get('database');
        const id = c.req.valid('param').id;

        const contract = await getRealisedContractById(db, id);

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
                data: toRealisedContractDTO(contract),
            },
            200,
        );
    },
);

export default realisedContractsRoutes;
