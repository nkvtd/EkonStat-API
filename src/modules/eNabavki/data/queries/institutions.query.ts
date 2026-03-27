import type {DbOrTx} from "../../../../shared/types/Database.type";
import {institutionsTable} from "../schema";
import {inArray} from "drizzle-orm";

export async function insertAndGetInstitutions(
    db: DbOrTx, 
    institutionStrings: string[]
): Promise<Map<string, number>> {
    
    if (institutionStrings.length === 0) return new Map();
    
    await db
        .insert(institutionsTable)
        .values(
            institutionStrings.map(s => ({ name: s }))
        )
        .onConflictDoNothing();
    
    const institutions = await db
        .select()
        .from(institutionsTable)
        .where(
            inArray(institutionsTable.name, institutionStrings)
        )
    
    return new Map(institutions.map(i => [i.name, i.id]));
}