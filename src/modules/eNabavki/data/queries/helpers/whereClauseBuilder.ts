import { SQL, eq, ilike, lte, gte, gt, lt } from "drizzle-orm";

export async function buildWhereClause(
    filters: Record<string, any>,
    mapping: Record<string, { column: any; operator: string }>
): Promise<SQL[]> {
    const filterConditions: SQL[] = [];

    for (const key in filters) {
        const value = filters[key];
        if (value === undefined || value === null) continue;

        const config = mapping[key];
        if (!config) continue;

        const { column, operator } = config;

        switch (operator) {
            case "eq":
                filterConditions.push(eq(column, value));
                break;
            case "ilike":
                filterConditions.push(ilike(column, `%${value}%`));
                break;
            case "lte":
                filterConditions.push(lte(column, value));
                break;
            case "gte":
                filterConditions.push(gte(column, value));
                break;
            case "gt":
                filterConditions.push(gt(column, value));
                break;
            case "lt":
                filterConditions.push(lt(column, value));
                break;
        }
    }

    return filterConditions;
}