import type {DbOrTx} from "../../../../shared/types/Database.type"
import {
    realisedTable,
    type RealisedInsert,
    type RealisedItem
} from "../schema";
import {and, asc, eq, gt, sql} from "drizzle-orm";
import {resolveInstitutionAndContractorIds} from "./helpers/idResolver";
import {buildWhereClause} from "./helpers/whereClauseBuilder";

export async function insertRealisedContracts(
    db: DbOrTx,
    contracts: RealisedInsert[]
): Promise<RealisedItem[]> {
    return await db.transaction(async (tx) => {
        const { institutionIds, contractorIds } = 
            await resolveInstitutionAndContractorIds(tx, 
                contracts.map(c => c.contractingInstitution),
                contracts.map(c => c.contractor)
            );

        contracts = contracts.map(c => ({
            ...c,
            contractingInstitutionId: institutionIds.get(c.contractingInstitution!),
            contractorId: c.contractor ? (contractorIds.get(c.contractor) ?? null) : null
        }));
        
        const inserted = await tx
            .insert(realisedTable)
            .values(contracts)
            .onConflictDoNothing({
                target: realisedTable.internalId
            })
            .returning();

        await tx.execute(sql`
            UPDATE e_nabavki.awarded_contracts ac
            SET realised_contract_id = rc.id
            FROM e_nabavki.realised_contracts rc
            WHERE ac.realised_contract_id IS NULL
              AND ac.contracting_institution_id = rc.contracting_institution_id
              AND ac.contractor_id = rc.contractor_id
              AND ac.original_contract_value = rc.assigned_contract_value
              AND ac.subject = rc.subject;
        `);
        
        return inserted;
    });
}

export async function getRealisedContracts(
    db: DbOrTx,
    query: any
): Promise<RealisedItem[] | []> {
    const { cursor, pageSize, ...filters } = query;

    let filterConditions = await buildWhereClause(filters, {
        institutionId:              { column: realisedTable.contractingInstitutionId, operator: "eq" },
        contractorId:               { column: realisedTable.contractorId, operator: "eq" },
        subject:                    { column: realisedTable.subject, operator: "ilike" },
        typeContractId:             { column: realisedTable.typeContractId, operator: "eq" },
        typeProcedureId:            { column: realisedTable.typeProcedureId, operator: "eq" },
        typeOfferId:                { column: realisedTable.typeOfferId, operator: "eq" },
        typeFrameworkAgreementId:   { column: realisedTable.typeFrameworkAgreementId, operator: "eq" },
        lessThanContractValue:      { column: realisedTable.assignedContractValue, operator: "lte" },
        moreThanContractValue:      { column: realisedTable.assignedContractValue, operator: "gte" },
        lessThanRealisedValue:      { column: realisedTable.realisedContractValue, operator: "lte" },
        moreThanRealisedValue:      { column: realisedTable.realisedContractValue, operator: "gte" },
        deliveryDate:               { column: realisedTable.deliveryDate, operator: "gte" },
    });
    
    const whereConditions = 
        and(
            cursor ? gt(realisedTable.id, cursor) : undefined,
            ...filterConditions
        )

    const contracts = await db
        .select()
        .from(realisedTable)
        .where(
            whereConditions
        )
        .limit(pageSize)
        .orderBy(asc(realisedTable.id));

    return contracts || [];
}

export async function getRealisedContractById(
    db: DbOrTx,
    id: number
): Promise<RealisedItem | null> {
    const [contract] = await db
        .select()
        .from(realisedTable)
        .where(
            eq(realisedTable.id, id)
        )
        .limit(1);

    return contract || null;
}