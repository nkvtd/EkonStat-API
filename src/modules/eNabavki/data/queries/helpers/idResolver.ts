import type {DbOrTx} from "../../../../../shared/types/Database.type";
import {insertAndGetInstitutions} from "../institutions.query";
import {insertAndGetContractors} from "../contractors.query";

export async function resolveInstitutionAndContractorIds(
    db: DbOrTx,
    institutions: any[],
    contractors: any[]
): Promise<{ institutionIds: Map<string, number>, contractorIds: Map<string, number> }> {
    const institutionStrings = [...new Set(institutions
        .filter((s): s is string => s !== null && s !== undefined && s.length > 0))]

    const institutionIds = await insertAndGetInstitutions(db, institutionStrings);

    const contractorStrings = [...new Set(contractors
        .filter((s): s is string => s !== null && s !== undefined && s.length > 0))]

    const contractorIds = await insertAndGetContractors(db, contractorStrings);

    return { institutionIds, contractorIds };
}