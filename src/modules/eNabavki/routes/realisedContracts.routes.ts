import {Hono} from "hono";
import type {Env} from "../../../infrastructure/server/Env.type";
import {getRealisedContractById, getRealisedContracts} from "../data/queries/realisedContracts.query";
import {zValidator} from "../../../infrastructure/server/validation/customValidator";
import {idParamSchema} from "../../../shared/validation/Id.schema";
import {realisedContractsQuerySchema} from "./validation/realisedContracts.schema";
import {toRealisedContractDTO, toRealisedContractDTOList} from "../data/dto/RealisedContract.dto";

const realisedContractsRoutes = new Hono<Env>();

realisedContractsRoutes.get(
    '/',
    zValidator('query', realisedContractsQuerySchema),
    async (c) => {
        const db = c.get('database');
        const query = c.req.valid('query');

        const contracts = await getRealisedContracts(db, query);
        const data = toRealisedContractDTOList(contracts);

        const nextCursor = data.length === query.pageSize ? data[data.length - 1]?.id : null;

        return c.json({
            data: data,
            meta: {
                nextCursor,
                pageSize: query.pageSize,
                hasMore: nextCursor !== null,
            }
        }, 200);
    });

realisedContractsRoutes.get(
    '/:id',
    zValidator('param', idParamSchema),
    async (c) => {
        const db = c.get('database');
        const id = c.req.valid('param').id;

        const contract = await getRealisedContractById(db, id);

        if (!contract) {
            return c.json({
                message: 'Specified contract id not found'
            }, 400);
        }

        const data = toRealisedContractDTO(contract);
        
        return c.json({
            data: data
        }, 200);
    });

export default realisedContractsRoutes;