import { and, asc, eq, gt, inArray, isNull } from 'drizzle-orm';
import type { DbOrTx } from '../../../../shared/types/Database.type.js';
import type { PaginatedFiltersQuery } from '../../../../shared/types/PaginatedFiltersQuery.type.js';
import {
    type AwardedItem,
    awardedTable,
    type ContractorItem,
    contractorsTable,
    type RealisedItem,
    realisedTable,
} from '../schema.js';
import { buildWhereClause } from './helpers/whereClauseBuilder.js';

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
    query: PaginatedFiltersQuery,
): Promise<ContractorItem[] | []> {
    const { cursor, pageSize, ...filters } = query;

    const filterConditions = await buildWhereClause(filters, {
        name: { column: contractorsTable.name, operator: 'contains' },
    });

    const whereConditions = and(
        cursor ? gt(contractorsTable.id, cursor) : undefined,
        ...filterConditions,
    );

    const contractors = await db
        .select()
        .from(contractorsTable)
        .where(whereConditions)
        .limit(pageSize)
        .orderBy(asc(contractorsTable.id));

    return contractors;
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
    query: PaginatedFiltersQuery,
): Promise<AwardedItem[] | []> {
    const { cursor, pageSize } = query;

    const contracts = await db
        .select()
        .from(awardedTable)
        .where(
            and(
                cursor ? gt(awardedTable.id, cursor) : undefined,
                eq(awardedTable.contractorId, id),
                isNull(awardedTable.realisedContractId),
            ),
        )
        .limit(pageSize)
        .orderBy(asc(awardedTable.id));

    return contracts;
}

export async function getRealisedContractsForContractorById(
    db: DbOrTx,
    id: number,
    query: PaginatedFiltersQuery,
): Promise<RealisedItem[] | []> {
    const { cursor, pageSize } = query;

    const contracts = await db
        .select()
        .from(realisedTable)
        .where(
            and(
                cursor ? gt(realisedTable.id, cursor) : undefined,
                eq(realisedTable.contractorId, id),
            ),
        )
        .limit(pageSize)
        .orderBy(asc(realisedTable.id));

    return contracts;
}
