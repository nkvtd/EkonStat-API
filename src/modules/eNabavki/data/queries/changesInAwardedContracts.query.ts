import type {DbOrTx} from "../../../../shared/types/Database.type"
import {
    changesInAwardedTable,
    type ChangesInAwardedInsert,
    type ChangesInAwardedItem
} from "../schema";
import {resolveInstitutionAndContractorIds} from "./helpers/idResolver";
import {eq, sql} from "drizzle-orm";

export async function insertChangesInAwardedContracts(
    db: DbOrTx,
    changes: ChangesInAwardedInsert[]
): Promise<ChangesInAwardedItem[]> {
    return await db.transaction(async (tx) => {
        const { institutionIds, contractorIds } =
            await resolveInstitutionAndContractorIds(tx,
                changes.map(c => c.contractingInstitution),
                changes.map(c => c.contractor)
            );

        changes = changes.map(c => ({
            ...c,
            contractingInstitutionId: institutionIds.get(c.contractingInstitution!),
            contractorId: c.contractor ? (contractorIds.get(c.contractor) ?? null) : null
        }));
        
        const inserted = await tx
            .insert(changesInAwardedTable)
            .values(changes)
            .onConflictDoNothing({
                target: changesInAwardedTable.internalId
            })
            .returning();

        await tx.execute(sql`
            UPDATE e_nabavki.changes_in_awarded_contracts cc
            SET awarded_contract_id = ac.id
            FROM e_nabavki.awarded_contracts ac
            WHERE cc.awarded_contract_id IS NULL
              AND cc.contracting_institution_id IS NOT DISTINCT FROM ac.contracting_institution_id
              AND cc.contractor_id IS NOT DISTINCT FROM ac.contractor_id
              AND cc.assigned_contract_value IS NOT DISTINCT FROM ac.original_contract_value
              AND cc.subject IS NOT DISTINCT FROM ac.subject;
        `);

        await tx.execute(sql`
            UPDATE e_nabavki.awarded_contracts ac
            SET num_changes = agg.cnt,
                latest_change_date = agg.latest,
                assigned_contract_value = agg.latest_value
            FROM (
                SELECT awarded_contract_id,
                    COUNT(*) AS cnt,
                    MAX(change_date) AS latest,
                    (ARRAY_AGG(updated_contract_value ORDER BY change_date DESC))[1] AS latest_value
                FROM e_nabavki.changes_in_awarded_contracts
                WHERE awarded_contract_id IS NOT NULL
                GROUP BY awarded_contract_id
            ) agg
            WHERE ac.id = agg.awarded_contract_id;
        `);
        
        return inserted;
    });
}

export async function getChangesForAwardedContractById(
    db: DbOrTx, 
    contractId: number
): Promise<ChangesInAwardedItem[] | null> {
    const changes = await db
        .select()
        .from(changesInAwardedTable)
        .where(
            eq(changesInAwardedTable.awardedContractId, contractId)
        );
    
    return changes.length > 0 ? changes : null;
}