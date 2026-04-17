import { and, asc, eq, gt, sql } from 'drizzle-orm';
import type { DbOrTx } from '../../../../shared/types/Database.type.js';
import type { PaginatedFiltersQuery } from '../../../../shared/types/PaginatedFiltersQuery.type.js';
import {
    type RealisedInsert,
    type RealisedItem,
    realisedTable,
} from '../schema.js';
import { resolveInstitutionAndContractorIds } from './helpers/idResolver.js';
import { buildWhereClause } from './helpers/whereClauseBuilder.js';

export async function insertRealisedContracts(
    db: DbOrTx,
    contracts: RealisedInsert[],
): Promise<RealisedItem[]> {
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
                // biome-ignore lint/style/noNonNullAssertion: <contractingInstitution is required for realised contracts, and should have been validated at this point>
                c.contractingInstitution!,
            ),
            contractorId: c.contractor
                ? (contractorIds.get(c.contractor) ?? null)
                : null,
        }));

        const inserted = await tx
            .insert(realisedTable)
            .values(contracts)
            .onConflictDoNothing({
                target: realisedTable.internalId,
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
                WHERE rc.id IN (${insertedIdsSql})
                    AND ac.contracting_institution_id IS NOT DISTINCT FROM rc.contracting_institution_id
                    AND ac.contractor_id IS NOT DISTINCT FROM rc.contractor_id
                    AND ac.original_contract_value IS NOT DISTINCT FROM rc.assigned_contract_value
                    AND ac.subject IS NOT DISTINCT FROM rc.subject
                ORDER BY rc.id ASC
                LIMIT 1
            )
            WHERE ac.realised_contract_id IS NULL
                AND EXISTS (
                    SELECT 1
                    FROM e_nabavki.realised_contracts rc
                    WHERE rc.id IN (${insertedIdsSql})
                        AND ac.contracting_institution_id IS NOT DISTINCT FROM rc.contracting_institution_id
                        AND ac.contractor_id IS NOT DISTINCT FROM rc.contractor_id
                        AND ac.original_contract_value IS NOT DISTINCT FROM rc.assigned_contract_value
                        AND ac.subject IS NOT DISTINCT FROM rc.subject
                );
        `);

        return inserted;
    });
}

export async function getRealisedContracts(
    db: DbOrTx,
    query: PaginatedFiltersQuery,
): Promise<RealisedItem[] | []> {
    const { cursor, pageSize, ...filters } = query;

    const filterConditions = await buildWhereClause(filters, {
        institutionId: {
            column: realisedTable.contractingInstitutionId,
            operator: 'eq',
        },
        institution: {
            column: realisedTable.contractingInstitution,
            operator: 'contains',
        },
        contractorId: { column: realisedTable.contractorId, operator: 'eq' },
        contractor: {
            column: realisedTable.contractor,
            operator: 'contains',
        },
        subject: { column: realisedTable.subject, operator: 'ilike' },
        typeContractId: {
            column: realisedTable.typeContractId,
            operator: 'eq',
        },
        typeProcedureId: {
            column: realisedTable.typeProcedureId,
            operator: 'eq',
        },
        typeOfferId: { column: realisedTable.typeOfferId, operator: 'eq' },
        typeFrameworkAgreementId: {
            column: realisedTable.typeFrameworkAgreementId,
            operator: 'eq',
        },
        lessThanAssignedValue: {
            column: realisedTable.assignedContractValue,
            operator: 'lte',
        },
        moreThanAssignedValue: {
            column: realisedTable.assignedContractValue,
            operator: 'gte',
        },
        lessThanRealisedValue: {
            column: realisedTable.realisedContractValue,
            operator: 'lte',
        },
        moreThanRealisedValue: {
            column: realisedTable.realisedContractValue,
            operator: 'gte',
        },
        deliveryDate: { column: realisedTable.deliveryDate, operator: 'gte' },
    });

    const whereConditions = and(
        cursor ? gt(realisedTable.id, cursor) : undefined,
        ...filterConditions,
    );

    const contracts = await db
        .select()
        .from(realisedTable)
        .where(whereConditions)
        .limit(pageSize)
        .orderBy(asc(realisedTable.id));

    return contracts;
}

export async function getRealisedContractById(
    db: DbOrTx,
    id: number,
): Promise<RealisedItem | null> {
    const [contract] = await db
        .select()
        .from(realisedTable)
        .where(eq(realisedTable.id, id))
        .limit(1);

    return contract || null;
}
