import {Hono} from "hono";
import type { Env } from "../../../infrastructure/server/Env.type";
import {getActiveAwardedContracts, getAwardedContractById} from "../data/queries/awardedContracts.query";
import {getChangesForAwardedContractById} from "../data/queries/changesInAwardedContracts.query";
import {awardedContractsQuerySchema} from "./validation/awardedContracts.schema";
import {idParamSchema} from "../../../shared/validation/Id.schema";
import {zValidator} from "../../../infrastructure/server/validation/customValidator";
import {toAwardedContractDTO, toAwardedContractDTOList} from "../data/dto/AwardedContract.dto";
import {toChangesInAwardedContractDTOList} from "../data/dto/ChangesInAwardedContract.dto";

const awardedContractsRoutes = new Hono<Env>();

awardedContractsRoutes.get(
    '/',
    zValidator('query', awardedContractsQuerySchema),
    async (c) => {
        const db = c.get('database');
        const query = c.req.valid('query');
        
        const contracts = await getActiveAwardedContracts(db, query);
        const data = toAwardedContractDTOList(contracts);

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

awardedContractsRoutes.get(
    '/:id', 
    zValidator('param', idParamSchema),
    async (c) => {
        const db = c.get('database');
        const id = c.req.valid('param').id;
        
        const contract = await getAwardedContractById(db, id);

        if (!contract) {
            return c.json({
                message: 'Specified contract id not found'
            }, 400);
        }

        const data = toAwardedContractDTO(contract);
        
        return c.json({
            data: data
        }, 200)
    });

awardedContractsRoutes.get(
    '/:id/changes',
    zValidator('param', idParamSchema),
    async (c) => {
        const db = c.get('database');
        const id = c.req.valid('param').id;
        
        const changes = await getChangesForAwardedContractById(db, id);
        
        if (!changes) {
            return c.json({
                message: 'No changes found for specified contract id'
            }, 400);
        }
        
        const data = toChangesInAwardedContractDTOList(changes);
        
        return c.json({
            data: data
        }, 200);
});

export default awardedContractsRoutes;