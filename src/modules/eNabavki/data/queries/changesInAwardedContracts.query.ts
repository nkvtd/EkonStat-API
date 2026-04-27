import { and, eq, sql } from 'drizzle-orm';
import type { DbOrTx } from '../../../../shared/types/Database.type.js';
import type { PaginatedResult } from './../../../../shared/types/PaginatedResult.type.js';
import type { PaginationQuery } from '../../../../shared/types/PaginationQuery.type.js';
import {
    type ChangesInAwardedInsert,
    type ChangesInAwardedItem,
    changesInAwardedTable,
} from '../schema.js';
import { buildCursorPagination } from './helpers/cursorPaginationBuilder.js';
import { resolveInstitutionAndContractorIds } from './helpers/idResolver.js';

export async function insertChangesInAwardedContracts(
    db: DbOrTx,
    changes: ChangesInAwardedInsert[],
): Promise<ChangesInAwardedItem[]> {
    if (changes.length === 0) return [];

    return await db.transaction(async (tx) => {
        const { institutionIds, contractorIds } =
            await resolveInstitutionAndContractorIds(
                tx,
                changes.map((c) => c.contractingInstitution),
                changes.map((c) => c.contractor),
            );

        changes = changes.map((c) => ({
            ...c,
            contractingInstitutionId: institutionIds.get(
                // biome-ignore lint/style/noNonNullAssertion: <contractingInstitution is required for changes in awarded contracts, and should have been validated at this point>
                c.contractingInstitution!,
            ),
            contractorId: c.contractor
                ? (contractorIds.get(c.contractor) ?? null)
                : null,
        }));

        const inserted = await tx
            .insert(changesInAwardedTable)
            .values(changes)
            .onConflictDoNothing({
                target: changesInAwardedTable.internalId,
            })
            .returning();

        if (inserted.length === 0) return [];

        const insertedIds = inserted.map((c) => c.id);
        const insertedIdsSql = sql.join(
            insertedIds.map((id) => sql`${id}`),
            sql`, `,
        );

        await tx.execute(sql`
            UPDATE e_nabavki.changes_in_awarded_contracts cc
            SET awarded_contract_id = ac.id
            FROM e_nabavki.awarded_contracts ac
            WHERE cc.id IN (${insertedIdsSql})
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
                WHERE awarded_contract_id = ANY(
                    SELECT awarded_contract_id
                    FROM e_nabavki.changes_in_awarded_contracts
                    WHERE id IN (${insertedIdsSql})
                        AND awarded_contract_id IS NOT NULL
                )
                GROUP BY awarded_contract_id
            ) agg
            WHERE ac.id = agg.awarded_contract_id;
        `);

        return inserted;
    });
}

export async function getChangesForAwardedContractById(
    db: DbOrTx,
    contractId: number,
    query: PaginationQuery,
): Promise<PaginatedResult<ChangesInAwardedItem>> {
    const { cursor, pageSize, sortBy, sortDirection } = query;

    const pagination = buildCursorPagination<
        ChangesInAwardedItem,
        'changeDate'
    >({
        cursor,
        pageSize,
        sortBy: sortBy as 'changeDate' | undefined,
        sortDirection,
        defaultSortBy: 'changeDate',
        defaultSortDirection: 'desc',
        idColumn: changesInAwardedTable.id,
        sorts: {
            changeDate: {
                orderByColumn: changesInAwardedTable.changeDate,
                getCursorValue: (row) => row.changeDate ?? '',
            },
        },
    });

    const changes = await db
        .select()
        .from(changesInAwardedTable)
        .where(
            and(
                pagination.whereCursor,
                eq(changesInAwardedTable.awardedContractId, contractId),
            ),
        )
        .limit(pagination.limit)
        .orderBy(...pagination.orderBy);

    return {
        data: pagination.page(changes),
        nextCursor: pagination.nextCursor(changes),
        invalidCursor: pagination.invalidCursor,
    };
}
