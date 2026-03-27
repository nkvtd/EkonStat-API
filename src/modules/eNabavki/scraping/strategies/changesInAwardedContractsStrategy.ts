import type {ScrapingStrategy} from "./Strategy.type";
import type {ChangesInAwardedInsert, ChangesInAwardedItem} from "../../data/schema";
import {formatDate, getCurrentDateISO, getCurrentDateString} from "../../util/dates";
import {buildBasePayload} from "../payloadBuilder";
import {normaliseName} from "../../util/names";
import {
    CHANGE_REASON_MAP,
    CONTRACT_TYPE_MAP,
    FRAMEWORK_AGREEMENT_TYPE,
    OFFER_TYPE_MAP,
    PROCEDURE_TYPE_MAP
} from "../../util/enums";
import {ENABAVKI_EVENTS} from "../../data/events";
import type {DbOrTx} from "../../../../shared/types/Database.type";
import {insertChangesInAwardedContracts} from "../../data/queries/changesInAwardedContracts.query";
import {type ChangesInAwardedDTO, toChangesInAwardedContractDTOList} from "../../data/dto/ChangesInAwardedContract.dto";

export const changesInAwardedContractsStrategy: ScrapingStrategy<ChangesInAwardedInsert, ChangesInAwardedItem, ChangesInAwardedDTO> = {
    name: "changes-in-awarded-contracts-processing",
    schedule: "0 */6 * * *",
    url: "https://e-nabavki.gov.mk/Notifications/GetNotificationAccpPublicChangeGridData",
    event: ENABAVKI_EVENTS.CHANGES_IN_AWARDED_CONTRACTS,

    buildPayload(): URLSearchParams {
        return buildBasePayload({
            orderColumn: '11',
            columns: [
                "DecisionNumber",
                "CiName",
                "Subject",
                "ProcurementType",
                "TypeOfProcedureStr",
                "AssignementDate",
                "ProcureInChargePerson",
                "EstimatedValue",
                "AssignedContractValue",
                "AssignedValue",
                "DifferenceInAssignedValue",
                "AnnouncementDate",
                "Documents"
            ],
            specialColumns: ["Documents"],
            discriminator: {
                ContractingInstitution: null,
                ProcureInChargePerson: null,
                Status: "",
                MatterOfContract: "",
                CaOfProcurement: "",
                PeriodFrom: "01.01.2020", //getCurrentDateString(),
                PeriodTo: getCurrentDateString(),
                NumberOfNotice: "",
                TypeOfPublicContract: "",
                TypeOfProcedure: "",
                ContractInstitution: "",
                DateContractFrom: "",
                DateContractTo: ""
            }
        });
    },

    parseResponse(response: any, dateISO: string): ChangesInAwardedInsert[] {
        return response.data.map((item: any) => ({
            internalId: item.Id,
            processNumber: item.DecisionNumber,
            contractingInstitution: normaliseName(item.CiName),
            contractor: normaliseName(item.ProcureInChargePerson),
            subject: item.Subject,
            changeReason: CHANGE_REASON_MAP[item.GroundForChange],
            changeReasonId: item.GroundForChange,
            assignedContractValue: item.AssignedValue,
            updatedContractValue: item.AssignedContractValue,
            differenceInValue: (item.AssignedValue-item.AssignedContractValue) > 0 ? item.DifferenceInAssignedValue*(-1) : item.DifferenceInAssignedValue,
            changeDate: formatDate(item.CreationDate),
            scrapeDate: dateISO
        })) as ChangesInAwardedInsert[];
    },
    
    insertData(db: DbOrTx, contracts: ChangesInAwardedInsert[]): Promise<ChangesInAwardedItem[]> {
        return insertChangesInAwardedContracts(db, contracts);
    },
    
    toDTO(contracts: ChangesInAwardedItem[]): ChangesInAwardedDTO[] {
        return toChangesInAwardedContractDTOList(contracts);
    }
}