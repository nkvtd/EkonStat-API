import type {RealisedItem} from "../schema";
import {toNumber} from "../../util/numbers";

export type RealisedDTO = {
    id: number;
    processNumber: string | null;
    institution: {
        id: number | null;
        name: string | null;
    },
    contractor: {
        id: number | null;
        name: string | null;
    },
    subject: string | null;
    contractType: {
        id: number | null;
        name: string | null;
    },
    procedureType: {
        id: number | null;
        name: string | null;
    },
    offerType: {
        id: number | null;
        name: string | null;
    },
    frameworkAgreementType: {
        id: number | null;
        name: string | null;
    },
    assignedContractValue: number | null;
    realisedContractValue: number | null;
    paidContractValue: number | null;
    deliveryDate: string | null;
}


export function toRealisedContractDTO(contract: RealisedItem): RealisedDTO {
    return ({
        id: contract.id,
        processNumber: contract.processNumber,
        institution: {
            id: contract.contractingInstitutionId,
            name: contract.contractingInstitution,
        },
        contractor: {
            id: contract.contractorId,
            name: contract.contractor
        },
        subject: contract.subject,
        contractType: {
            id: contract.typeContractId,
            name: contract.typeContract
        },
        procedureType: {
            id: contract.typeProcedureId,
            name: contract.typeProcedure
        },
        offerType: {
            id: contract.typeOfferId,
            name: contract.typeOffer
        },
        frameworkAgreementType: {
            id: contract.typeFrameworkAgreementId,
            name: contract.typeFrameworkAgreement
        },
        assignedContractValue: toNumber(contract.assignedContractValue),
        realisedContractValue: toNumber(contract.realisedContractValue),
        paidContractValue: toNumber(contract.paidRealisedContractValue),
        deliveryDate: contract.deliveryDate
    });
}

export function toRealisedContractDTOList(contracts: RealisedItem[]): RealisedDTO[] {
    return contracts.map(toRealisedContractDTO);
}