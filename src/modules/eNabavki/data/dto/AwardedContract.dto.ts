import { toNumber } from '../../util/numbers.js';
import type { AwardedItem } from '../schema.js';

export type AwardedDTO = {
    id: number;
    processNumber: string | null;
    numChanges: number | null;
    institution: {
        id: number | null;
        name: string | null;
    };
    contractor: {
        id: number | null;
        name: string | null;
    };
    smallContract: boolean | null;
    subject: string | null;
    contractType: {
        id: number | null;
        name: string | null;
    };
    procedureType: {
        id: number | null;
        name: string | null;
    };
    offerType: {
        id: number | null;
        name: string | null;
    };
    frameworkAgreementType: {
        id: number | null;
        name: string | null;
    };
    estimatedContractValue: number | null;
    originalContractValue: number | null;
    assignedContractValue: number | null;
    postDate: string | null;
    latestChangeDate: string | null;
};

export function toAwardedContractDTO(contract: AwardedItem): AwardedDTO {
    return {
        id: contract.id,
        processNumber: contract.processNumber,
        numChanges: contract.numChanges,
        institution: {
            id: contract.contractingInstitutionId,
            name: contract.contractingInstitution,
        },
        contractor: {
            id: contract.contractorId,
            name: contract.contractor,
        },
        smallContract: contract.smallContract,
        subject: contract.subject,
        contractType: {
            id: contract.typeContractId,
            name: contract.typeContract,
        },
        procedureType: {
            id: contract.typeProcedureId,
            name: contract.typeProcedure,
        },
        offerType: {
            id: contract.typeOfferId,
            name: contract.typeOffer,
        },
        frameworkAgreementType: {
            id: contract.typeFrameworkAgreementId,
            name: contract.typeFrameworkAgreement,
        },
        estimatedContractValue: toNumber(contract.estimatedContractValue),
        originalContractValue: toNumber(contract.originalContractValue),
        assignedContractValue: toNumber(contract.assignedContractValue),
        postDate: contract.postDate,
        latestChangeDate: contract.latestChangeDate,
    };
}

export function toAwardedContractDTOList(
    contracts: AwardedItem[],
): AwardedDTO[] {
    return contracts.map(toAwardedContractDTO);
}
