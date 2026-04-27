import { and, eq, inArray, isNull } from 'drizzle-orm';
import type { DbOrTx } from '../../../../shared/types/Database.type.js';
import type { PaginatedResult } from './../../../../shared/types/PaginatedResult.type.js';
import type { PaginationQuery } from '../../../../shared/types/PaginationQuery.type.js';
import {
    type AwardedItem,
    awardedTable,
    type ContractorItem,
    contractorsTable,
    type RealisedItem,
    realisedTable,
} from '../schema.js';
import { buildCursorPagination } from './helpers/cursorPaginationBuilder.js';
import { buildFilterConditions } from './helpers/filterConditionsBuilder.js';

export async function insertAndGetContractors(
    db: DbOrTx,
    contractorStrings: string[],
): Promise<Map<string, number>> {
    if (contractorStrings.length === 0) return new Map();

    await db
        .insert(contractorsTable)
        .values(contractorStrings.map((s) => ({ name: s })))
        .onConflictDoNothing();

    const contractors = await db
        .select()
        .from(contractorsTable)
        .where(inArray(contractorsTable.name, contractorStrings));

    return new Map(contractors.map((i) => [i.name, i.id]));
}

export async function getContractors(
    db: DbOrTx,
    query: PaginationQuery,
): Promise<PaginatedResult<ContractorItem>> {
    const { cursor, pageSize, sortBy, sortDirection, ...filters } = query;

    const pagination = buildCursorPagination<
        ContractorItem,
        'id' | 'awardedContractsCount' | 'realisedContractsCount' | 'earnings'
    >({
        cursor,
        pageSize,
        sortBy: sortBy as
            | 'id'
            | 'awardedContractsCount'
            | 'realisedContractsCount'
            | 'earnings'
            | undefined,
        sortDirection,
        defaultSortBy: 'id',
        defaultSortDirection: 'asc',
        idColumn: contractorsTable.id,
        sorts: {
            id: {
                orderByColumn: contractorsTable.id,
                getCursorValue: (row) => row.id,
            },
            awardedContractsCount: {
                orderByColumn: contractorsTable.awardedContractsCount,
                getCursorValue: (row) => row.awardedContractsCount ?? 0,
            },
            realisedContractsCount: {
                orderByColumn: contractorsTable.realisedContractsCount,
                getCursorValue: (row) => row.realisedContractsCount ?? 0,
            },
            earnings: {
                orderByColumn: contractorsTable.earnings,
                getCursorValue: (row) => row.earnings ?? '',
            },
        },
    });

    const filterConditions = await buildFilterConditions(filters, {
        name: { column: contractorsTable.name, operator: 'contains' },
        earnings: { column: contractorsTable.earnings, operator: 'eq' },
        moreThanEarnings: {
            column: contractorsTable.earnings,
            operator: 'gte',
        },
        lessThanEarnings: {
            column: contractorsTable.earnings,
            operator: 'lte',
        },
        awardedContractsCount: {
            column: contractorsTable.awardedContractsCount,
            operator: 'eq',
        },
        moreThanAwardedContractsCount: {
            column: contractorsTable.awardedContractsCount,
            operator: 'gte',
        },
        lessThanAwardedContractsCount: {
            column: contractorsTable.awardedContractsCount,
            operator: 'lte',
        },
        realisedContractsCount: {
            column: contractorsTable.realisedContractsCount,
            operator: 'eq',
        },
        moreThanRealisedContractsCount: {
            column: contractorsTable.realisedContractsCount,
            operator: 'gte',
        },
        lessThanRealisedContractsCount: {
            column: contractorsTable.realisedContractsCount,
            operator: 'lte',
        },
    });

    const whereConditions = and(pagination.whereCursor, ...filterConditions);

    const contractors = await db
        .select()
        .from(contractorsTable)
        .where(whereConditions)
        .limit(pagination.limit)
        .orderBy(...pagination.orderBy);

    return {
        data: pagination.page(contractors),
        nextCursor: pagination.nextCursor(contractors),
        invalidCursor: pagination.invalidCursor,
    };
}

export async function getContractorById(
    db: DbOrTx,
    id: number,
): Promise<ContractorItem | null> {
    const [contractor] = await db
        .select()
        .from(contractorsTable)
        .where(eq(contractorsTable.id, id))
        .limit(1);

    return contractor || null;
}

export async function getAwardedContractsForContractorById(
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
                eq(awardedTable.contractorId, id),
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

export async function getRealisedContractsForContractorById(
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
        .where(and(pagination.whereCursor, eq(realisedTable.contractorId, id)))
        .limit(pagination.limit)
        .orderBy(...pagination.orderBy);

    return {
        data: pagination.page(contracts),
        nextCursor: pagination.nextCursor(contracts),
        invalidCursor: pagination.invalidCursor,
    };
}

export async function getTotalContractorsCount(db: DbOrTx): Promise<number> {
    return await db.$count(contractorsTable);
}
