import { and, asc, eq, gt, isNull, sql } from 'drizzle-orm';
import type { DbOrTx } from '../../../../shared/types/Database.type.js';
import type { PaginatedFiltersQuery } from '../../../../shared/types/PaginatedFiltersQuery.type.js';
import {
    type AwardedInsert,
    type AwardedItem,
    awardedTable,
} from '../schema.js';
import { resolveInstitutionAndContractorIds } from './helpers/idResolver.js';
import { buildWhereClause } from './helpers/whereClauseBuilder.js';

export async function insertAwardedContracts(
    db: DbOrTx,
    contracts: AwardedInsert[],
): Promise<AwardedItem[]> {
    if (contracts.length === 0) return [];

    return await db.transaction(async (tx) => {
        const { institutionIds, contractorIds } =
            await resolveInstitutionAndContractorIds(
                tx,
                contracts.map((c) => c.contractingInstitution),
                contracts.map((c) => c.contractor),
            );

        contracts = contracts.map((c) => ({
            ...c,
            contractingInstitutionId: institutionIds.get(
                // biome-ignore lint/style/noNonNullAssertion: <contractingInstitution is required for awarded contracts, and should have been validated at this point>
                c.contractingInstitution!,
            ),
            contractorId: c.contractor
                ? (contractorIds.get(c.contractor) ?? null)
                : null,
        }));

        const inserted = await tx
            .insert(awardedTable)
            .values(contracts)
            .onConflictDoNothing({
                target: awardedTable.internalId,
            })
            .returning();

        if (inserted.length === 0) return [];

        const insertedIds = inserted.map((c) => c.id);
        const insertedIdsSql = sql.join(
            insertedIds.map((id) => sql`${id}`),
            sql`, `,
        );

        await tx.execute(sql`
            UPDATE e_nabavki.awarded_contracts ac
            SET realised_contract_id = (
                SELECT rc.id
                FROM e_nabavki.realised_contracts rc
                WHERE ac.contracting_institution_id IS NOT DISTINCT FROM rc.contracting_institution_id
                    AND ac.contractor_id IS NOT DISTINCT FROM rc.contractor_id
                    AND ac.original_contract_value IS NOT DISTINCT FROM rc.assigned_contract_value
                    AND ac.subject IS NOT DISTINCT FROM rc.subject
                ORDER BY rc.id ASC
                LIMIT 1
            )
            WHERE ac.id IN (${insertedIdsSql})
                AND ac.realised_contract_id IS NULL
                AND EXISTS (
                    SELECT 1
                    FROM e_nabavki.realised_contracts rc
                    WHERE ac.contracting_institution_id IS NOT DISTINCT FROM rc.contracting_institution_id
                        AND ac.contractor_id IS NOT DISTINCT FROM rc.contractor_id
                        AND ac.original_contract_value IS NOT DISTINCT FROM rc.assigned_contract_value
                        AND ac.subject IS NOT DISTINCT FROM rc.subject
                );
        `);

        await tx.execute(sql`
            UPDATE e_nabavki.changes_in_awarded_contracts cc
            SET awarded_contract_id = ac.id
            FROM e_nabavki.awarded_contracts ac
            WHERE ac.id IN (${insertedIdsSql})
                AND cc.awarded_contract_id IS NULL
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
                WHERE awarded_contract_id IN (${insertedIdsSql})
                    AND awarded_contract_id IS NOT NULL
                GROUP BY awarded_contract_id
            ) agg
            WHERE ac.id = agg.awarded_contract_id;
        `);

        return inserted;
    });
}

export async function getActiveAwardedContracts(
    db: DbOrTx,
    query: PaginatedFiltersQuery,
): Promise<AwardedItem[] | []> {
    const { cursor, pageSize, ...filters } = query;

    const filterConditions = await buildWhereClause(filters, {
        numChanges: { column: awardedTable.numChanges, operator: 'eq' },
        institutionId: {
            column: awardedTable.contractingInstitutionId,
            operator: 'eq',
        },
        contractorId: { column: awardedTable.contractorId, operator: 'eq' },
        smallContract: { column: awardedTable.smallContract, operator: 'eq' },
        subject: { column: awardedTable.subject, operator: 'ilike' },
        typeContractId: { column: awardedTable.typeContractId, operator: 'eq' },
        typeProcedureId: {
            column: awardedTable.typeProcedureId,
            operator: 'eq',
        },
        typeOfferId: { column: awardedTable.typeOfferId, operator: 'eq' },
        typeFrameworkAgreementId: {
            column: awardedTable.typeFrameworkAgreementId,
            operator: 'eq',
        },
        lessThanAssignedValue: {
            column: awardedTable.assignedContractValue,
            operator: 'lte',
        },
        moreThanAssignedValue: {
            column: awardedTable.assignedContractValue,
            operator: 'gte',
        },
        assignmentDate: {
            column: awardedTable.assignmentDate,
            operator: 'gte',
        },
    });

    const whereConditions = and(
        cursor ? gt(awardedTable.id, cursor) : undefined,
        isNull(awardedTable.realisedContractId),
        ...filterConditions,
    );

    const contracts = await db
        .select()
        .from(awardedTable)
        .where(whereConditions)
        .limit(pageSize)
        .orderBy(asc(awardedTable.id));

    return contracts;
}

export async function getAwardedContractById(db: DbOrTx, contractId: number) {
    const [contract] = await db
        .select()
        .from(awardedTable)
        .where(eq(awardedTable.id, contractId))
        .limit(1);

    return contract || null;
}
