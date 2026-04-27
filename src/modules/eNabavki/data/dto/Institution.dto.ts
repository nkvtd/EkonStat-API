import { toNumber } from '../../util/numbers.js';
import type { InstitutionItem } from '../schema.js';

export type InstitutionDto = {
    id: number;
    name: string;
    awardedContractsCount: number | null;
    realisedContractsCount: number | null;
    spendings: number | null;
};

export function toInstitutionDTO(institution: InstitutionItem): InstitutionDto {
    return {
        id: institution.id,
        name: institution.name,
        awardedContractsCount: institution.awardedContractsCount,
        realisedContractsCount: institution.realisedContractsCount,
        spendings: toNumber(institution.spendings),
    };
}

export function toInstitutionDTOList(
    institutions: InstitutionItem[],
): InstitutionDto[] {
    return institutions.map(toInstitutionDTO);
}
