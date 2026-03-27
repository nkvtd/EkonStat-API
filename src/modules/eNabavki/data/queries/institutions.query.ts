import { and, asc, eq, gt, inArray, isNull } from 'drizzle-orm';
import type { DbOrTx } from '../../../../shared/types/Database.type.js';
import type { PaginatedFiltersQuery } from './../../../../shared/types/PaginatedFiltersQuery.type.js';
import {
    type AwardedItem,
    awardedTable,
    type InstitutionItem,
    institutionsTable,
    type RealisedItem,
    realisedTable,
} from '../schema.js';
import { buildWhereClause } from './helpers/whereClauseBuilder.js';

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
    query: PaginatedFiltersQuery,
): Promise<InstitutionItem[] | []> {
    const { cursor, pageSize, ...filters } = query;

    const filterConditions = await buildWhereClause(filters, {
        name: { column: institutionsTable.name, operator: 'ilike' },
    });

    const whereConditions = and(
        cursor ? gt(institutionsTable.id, cursor) : undefined,
        ...filterConditions,
    );

    const institutions = await db
        .select()
        .from(institutionsTable)
        .where(whereConditions)
        .limit(pageSize)
        .orderBy(asc(institutionsTable.id));

    return institutions;
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
    query: PaginatedFiltersQuery,
): Promise<AwardedItem[] | []> {
    const { cursor, pageSize } = query;

    const contracts = await db
        .select()
        .from(awardedTable)
        .where(
            and(
                cursor ? gt(awardedTable.id, cursor) : undefined,
                eq(awardedTable.contractingInstitutionId, id),
                isNull(awardedTable.realisedContractId),
            ),
        )
        .limit(pageSize)
        .orderBy(asc(awardedTable.id));

    return contracts;
}

export async function getRealisedContractsForInstitutionById(
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
                eq(realisedTable.contractingInstitutionId, id),
            ),
        )
        .limit(pageSize)
        .orderBy(asc(realisedTable.id));

    return contracts;
}
