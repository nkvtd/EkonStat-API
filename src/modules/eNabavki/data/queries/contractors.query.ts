import type {DbOrTx} from "../../../../shared/types/Database.type";
import {contractorsTable} from "../schema";
import {inArray} from "drizzle-orm";

export async function insertAndGetContractors(
    db: DbOrTx, 
    contractorStrings: string[]
): Promise<Map<string, number>>  {

    if (contractorStrings.length === 0) return new Map();

    await db
        .insert(contractorsTable)
        .values(
            contractorStrings.map(s => ({ name: s }))
        )
        .onConflictDoNothing();

    const contractors = await db
        .select()
        .from(contractorsTable)
        .where(
            inArray(contractorsTable.name, contractorStrings)
        )

    return new Map(contractors.map(i => [i.name, i.id]));
}