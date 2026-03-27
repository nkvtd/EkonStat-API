import { eq, gt, gte, ilike, lt, lte, type SQL } from 'drizzle-orm';

type FilterOperator = 'eq' | 'ilike' | 'lte' | 'gte' | 'gt' | 'lt';

type FilterMapping = Record<
    string,
    {
        column: unknown;
        operator: FilterOperator;
    }
>;

export function buildWhereClause(
    filters: Record<string, unknown>,
    mapping: FilterMapping,
): SQL[] {
    const filterConditions: SQL[] = [];

    for (const key in filters) {
        const value = filters[key];
        if (value === undefined || value === null) continue;

        const config = mapping[key];
        if (!config) continue;

        const { column, operator } = config;

        switch (operator) {
            case 'eq':
                filterConditions.push(eq(column as never, value as never));
                break;
            case 'ilike':
                filterConditions.push(ilike(column as never, `%${value}%`));
                break;
            case 'lte':
                filterConditions.push(lte(column as never, value as never));
                break;
            case 'gte':
                filterConditions.push(gte(column as never, value as never));
                break;
            case 'gt':
                filterConditions.push(gt(column as never, value as never));
                break;
            case 'lt':
                filterConditions.push(lt(column as never, value as never));
                break;
        }
    }

    return filterConditions;
}
