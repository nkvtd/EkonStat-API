import type {ScrapingStrategy} from "./Strategy.type";
import type {AwardedInsert, AwardedItem} from "../../data/schema";
import {formatDate, getCurrentDateISO, getCurrentDateString} from "../../util/dates";
import {buildBasePayload} from "../payloadBuilder";
import {normaliseName} from "../../util/names";
import {
    CONTRACT_TYPE_MAP,
    FRAMEWORK_AGREEMENT_TYPE,
    OFFER_TYPE_MAP,
    PROCEDURE_TYPE_MAP
} from "../../util/enums";
import {ENABAVKI_EVENTS} from "../../data/events";
import {insertAwardedContracts} from "../../data/queries/awardedContracts.query";
import type {DbOrTx} from "../../../../shared/types/Database.type";
import {type AwardedDTO, toAwardedContractDTOList} from "../../data/dto/AwardedContract.dto";

export const awardedContractsStrategy: ScrapingStrategy<AwardedInsert, AwardedItem, AwardedDTO> = {
    name: "awarded-contracts-processing",
    schedule: "0 * * * *",
    url: "https://e-nabavki.gov.mk/Services/AcceptanceNotifications.asmx/GetGridData",
    event: ENABAVKI_EVENTS.NEW_AWARDED_CONTRACTS,
    
    buildPayload(): URLSearchParams {
        return buildBasePayload({
            orderColumn: '9',
            columns: [
                "ProcessNumber",
                "ContractingInstitutionName",
                "Subject",
                "ProcurementType",
                "ProcedureType",
                "AssignementDate",
                "PersonInCharge",
                "EstimatedPrice",
                "AssignedPrice",
                "AnnouncementDate",
                "BeneficialOwners",
                "Documents"
            ],
            specialColumns: ["BeneficialOwners", "Documents"],
            discriminator: {
                ContractingInstitution: { id: 0, text: "" },
                VendorMB: "",
                ProcessNumber: "",
                ContractingInstitutionName: null,
                PeriodFrom: "01.01.2020", //getCurrentDateString(),
                PeriodTo: getCurrentDateString(),
                DateContractFrom: "",
                DateContractTo: "",
                Subject: "",
                Contractor: "",
                TypeOfPublicContracts: "",
                TypeOfProcedure: "",
                IsCovid: false,
                OfferType: "",
                IsTerminated: "",
                BeneficialOwnerFullName: "",
                ProcureInChargePerson: null
            }
        });
    },
    
    parseResponse(response: any, dateISO: string): AwardedInsert[] {
        return response.data.map((item: any) => ({
            internalId: item.Id,
            processNumber: item.ProcessNumber,
            contractingInstitution: normaliseName(item.ContractingInstitutionName),
            contractor: normaliseName(item.VendorName),
            smallContract: item.IsSmallPublicProcurement,
            beneficialOwners: item.BeneficialOwners,
            subject: item.Subject,
            typeContract: CONTRACT_TYPE_MAP[item.ProcurementTypeId],
            typeContractId: item.ProcurementTypeId,
            typeProcedure: PROCEDURE_TYPE_MAP[item.ProcedureTypeId],
            typeProcedureId: item.ProcedureTypeId,
            typeOffer: OFFER_TYPE_MAP[item.OfferTypeId],
            typeOfferId: item.OfferTypeId,
            typeFrameworkAgreement: FRAMEWORK_AGREEMENT_TYPE[item.FrameworkType],
            typeFrameworkAgreementId:  item.FrameworkType,
            estimatedContractValue: item.EstimatedPrice,
            originalContractValue: item.AssignedPrice,
            assignedContractValue: item.AssignedPrice,
            assignmentDate: formatDate(item.AssignementDate),
            latestChangeDate: formatDate(item.AssignementDate),
            scrapeDate: dateISO
        })) as AwardedInsert[];
    },
    
    insertData(db: DbOrTx, contracts: AwardedInsert[]): Promise<AwardedItem[]> {
        return insertAwardedContracts(db, contracts);
    },
    
    toDTO(contracts: AwardedItem[]): AwardedDTO[] {
        return toAwardedContractDTOList(contracts);
    }
}