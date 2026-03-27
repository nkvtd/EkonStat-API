import type { InstitutionItem } from '../schema.js';

export type InstitutionDto = {
    id: number;
    name: string;
};

export function toInstitutionDTO(institution: InstitutionItem): InstitutionDto {
    return {
        id: institution.id,
        name: institution.name,
    };
}

export function toInstitutionDTOList(
    institutions: InstitutionItem[],
): InstitutionDto[] {
    return institutions.map(toInstitutionDTO);
}
