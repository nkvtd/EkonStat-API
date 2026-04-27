import { and, eq, inArray, isNull } from 'drizzle-orm';
import type { DbOrTx } from '../../../../shared/types/Database.type.js';
import type { PaginatedResult } from './../../../../shared/types/PaginatedResult.type.js';
import type { PaginationQuery } from '../../../../shared/types/PaginationQuery.type.js';
import {
    type AwardedItem,
    awardedTable,
    type InstitutionItem,
    institutionsTable,
    type RealisedItem,
    realisedTable,
} from '../schema.js';
import { buildCursorPagination } from './helpers/cursorPaginationBuilder.js';
import { buildFilterConditions } from './helpers/filterConditionsBuilder.js';

export async function insertAndGetInstitutions(
    db: DbOrTx,
    institutionStrings: string[],
): Promise<Map<string, number>> {
    if (institutionStrings.length === 0) return new Map();

    await db
        .insert(institutionsTable)
        .values(institutionStrings.map((s) => ({ name: s })))
        .onConflictDoNothing();

    const institutions = await db
        .select()
        .from(institutionsTable)
        .where(inArray(institutionsTable.name, institutionStrings));

    return new Map(institutions.map((i) => [i.name, i.id]));
}

export async function getInstitutions(
    db: DbOrTx,
    query: PaginationQuery,
): Promise<PaginatedResult<InstitutionItem>> {
    const { cursor, pageSize, sortBy, sortDirection, ...filters } = query;

    const pagination = buildCursorPagination<
        InstitutionItem,
        'id' | 'awardedContractsCount' | 'realisedContractsCount' | 'spendings'
    >({
        cursor,
        pageSize,
        sortBy: sortBy as
            | 'id'
            | 'awardedContractsCount'
            | 'realisedContractsCount'
            | 'spendings'
            | undefined,
        sortDirection,
        defaultSortBy: 'id',
        defaultSortDirection: 'asc',
        idColumn: institutionsTable.id,
        sorts: {
            id: {
                orderByColumn: institutionsTable.id,
                getCursorValue: (row) => row.id,
            },
            awardedContractsCount: {
                orderByColumn: institutionsTable.awardedContractsCount,
                getCursorValue: (row) => row.awardedContractsCount ?? 0,
            },
            realisedContractsCount: {
                orderByColumn: institutionsTable.realisedContractsCount,
                getCursorValue: (row) => row.realisedContractsCount ?? 0,
            },
            spendings: {
                orderByColumn: institutionsTable.spendings,
                getCursorValue: (row) => row.spendings ?? '',
            },
        },
    });

    const filterConditions = await buildFilterConditions(filters, {
        name: { column: institutionsTable.name, operator: 'contains' },
        spendings: { column: institutionsTable.spendings, operator: 'eq' },
        moreThanSpendings: {
            column: institutionsTable.spendings,
            operator: 'gte',
        },
        lessThanSpendings: {
            column: institutionsTable.spendings,
            operator: 'lte',
        },
        awardedContractsCount: {
            column: institutionsTable.awardedContractsCount,
            operator: 'eq',
        },
        moreThanAwardedContractsCount: {
            column: institutionsTable.awardedContractsCount,
            operator: 'gte',
        },
        lessThanAwardedContractsCount: {
            column: institutionsTable.awardedContractsCount,
            operator: 'lte',
        },
        realisedContractsCount: {
            column: institutionsTable.realisedContractsCount,
            operator: 'eq',
        },
        moreThanRealisedContractsCount: {
            column: institutionsTable.realisedContractsCount,
            operator: 'gte',
        },
        lessThanRealisedContractsCount: {
            column: institutionsTable.realisedContractsCount,
            operator: 'lte',
        },
    });

    const whereConditions = and(pagination.whereCursor, ...filterConditions);

    const institutions = await db
        .select()
        .from(institutionsTable)
        .where(whereConditions)
        .limit(pagination.limit)
        .orderBy(...pagination.orderBy);

    return {
        data: pagination.page(institutions),
        nextCursor: pagination.nextCursor(institutions),
        invalidCursor: pagination.invalidCursor,
    };
}

export async function getInstitutionById(
    db: DbOrTx,
    id: number,
): Promise<InstitutionItem | null> {
    const [institution] = await db
        .select()
        .from(institutionsTable)
        .where(eq(institutionsTable.id, id))
        .limit(1);

    return institution || null;
}

export async function getAwardedContractsForInstitutionById(
    db: DbOrTx,
    id: number,
    query: PaginationQuery,
): Promise<PaginatedResult<AwardedItem>> {
    const { cursor, pageSize } = query;

    const pagination = buildCursorPagination<AwardedItem, 'id'>({
        cursor,
        pageSize,
        sortBy: 'id',
        sortDirection: 'asc',
        defaultSortBy: 'id',
        defaultSortDirection: 'asc',
        idColumn: awardedTable.id,
        sorts: {
            id: {
                orderByColumn: awardedTable.id,
                getCursorValue: (row) => row.id,
            },
        },
    });

    const contracts = await db
        .select()
        .from(awardedTable)
        .where(
            and(
                pagination.whereCursor,
                eq(awardedTable.contractingInstitutionId, id),
                isNull(awardedTable.realisedContractId),
            ),
        )
        .limit(pagination.limit)
        .orderBy(...pagination.orderBy);

    return {
        data: pagination.page(contracts),
        nextCursor: pagination.nextCursor(contracts),
        invalidCursor: pagination.invalidCursor,
    };
}

export async function getRealisedContractsForInstitutionById(
    db: DbOrTx,
    id: number,
    query: PaginationQuery,
): Promise<PaginatedResult<RealisedItem>> {
    const { cursor, pageSize } = query;

    const pagination = buildCursorPagination<RealisedItem, 'id'>({
        cursor,
        pageSize,
        sortBy: 'id',
        sortDirection: 'asc',
        defaultSortBy: 'id',
        defaultSortDirection: 'asc',
        idColumn: realisedTable.id,
        sorts: {
            id: {
                orderByColumn: realisedTable.id,
                getCursorValue: (row) => row.id,
            },
        },
    });

    const contracts = await db
        .select()
        .from(realisedTable)
        .where(
            and(
                pagination.whereCursor,
                eq(realisedTable.contractingInstitutionId, id),
            ),
        )
        .limit(pagination.limit)
        .orderBy(...pagination.orderBy);

    return {
        data: pagination.page(contracts),
        nextCursor: pagination.nextCursor(contracts),
        invalidCursor: pagination.invalidCursor,
    };
}

export async function getTotalInstitutionsCount(db: DbOrTx): Promise<number> {
    return await db.$count(institutionsTable);
}
