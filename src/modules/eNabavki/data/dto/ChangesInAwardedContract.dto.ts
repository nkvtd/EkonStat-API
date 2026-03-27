import type {ChangesInAwardedItem} from "../schema";
import {toNumber} from "../../util/numbers";

export type ChangesInAwardedDTO = {
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
    changeReason: { 
        id: number | null; 
        name: string | null;
    },
    assignedContractValue: number | null;
    updatedContractValue: number | null;
    differenceInValue: number | null;
    changeDate: string | null;
}


export function toChangesInAwardedContractDTO(contract: ChangesInAwardedItem): ChangesInAwardedDTO {
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
        changeReason: {
            id: contract.changeReasonId,
            name: contract.changeReason
        },
        assignedContractValue: toNumber(contract.assignedContractValue),
        updatedContractValue: toNumber(contract.updatedContractValue),
        differenceInValue: toNumber(contract.differenceInValue),
        changeDate: contract.changeDate
    });
}

export function toChangesInAwardedContractDTOList(contracts: ChangesInAwardedItem[]): ChangesInAwardedDTO[] {
    return contracts.map(toChangesInAwardedContractDTO);
}