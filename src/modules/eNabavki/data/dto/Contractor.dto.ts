import type { ContractorItem } from '../schema.js';

export type ContractorDto = {
    id: number;
    name: string;
};

export function toContractorDTO(contractor: ContractorItem): ContractorDto {
    return {
        id: contractor.id,
        name: contractor.name,
    };
}

export function toContractorDTOList(
    contractors: ContractorItem[],
): ContractorDto[] {
    return contractors.map(toContractorDTO);
}
