import { toNumber } from '../../util/numbers.js';
import type { ContractorItem } from '../schema.js';

export type ContractorDto = {
    id: number;
    name: string;
    awardedContractsCount: number | null;
    realisedContractsCount: number | null;
    earnings: number | null;
};

export function toContractorDTO(contractor: ContractorItem): ContractorDto {
    return {
        id: contractor.id,
        name: contractor.name,
        awardedContractsCount: contractor.awardedContractsCount,
        realisedContractsCount: contractor.realisedContractsCount,
        earnings: toNumber(contractor.earnings),
    };
}

export function toContractorDTOList(
    contractors: ContractorItem[],
): ContractorDto[] {
    return contractors.map(toContractorDTO);
}
