import type {ScrapingStrategy} from "./Strategy.type";
import type {RealisedInsert, RealisedItem} from "../../data/schema";
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
import type {DbOrTx} from "../../../../shared/types/Database.type";
import {insertRealisedContracts} from "../../data/queries/realisedContracts.query";
import {type RealisedDTO, toRealisedContractDTOList} from "../../data/dto/RealisedDTO";

export const realisedContractsStrategy: ScrapingStrategy<RealisedInsert, RealisedItem, RealisedDTO> = {
    name: "realised-contracts-processing",
    schedule: "0 * * * *",
    url: "https://e-nabavki.gov.mk/Services/NotificationRealizedContract.asmx/GetGridData",
    event: ENABAVKI_EVENTS.NEW_REALISED_CONTRACTS,
    
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

    parseResponse(response: any, dateISO: string): RealisedInsert[] {
        return response.data.map((item: any) => ({
            internalId: item.Id,
            processNumber: item.ProcessNumber,
            contractingInstitution: normaliseName(item.Name),
            contractor: normaliseName(item.ProcureInChargePerson),
            subject: item.Subject,
            typeContract: CONTRACT_TYPE_MAP[item.TypeOfProcurement],
            typeContractId: item.TypeOfProcurement,
            typeProcedure: PROCEDURE_TYPE_MAP[item.RelatedProcedureType],
            typeProcedureId: item.RelatedProcedureType,
            typeOffer: OFFER_TYPE_MAP[item.OfferTypeId],
            typeOfferId: item.OfferTypeId,
            typeFrameworkAgreement: FRAMEWORK_AGREEMENT_TYPE[item.FrameworkType],
            typeFrameworkAgreementId: item.FrameworkType,
            assignedContractValue: item.AssignedPrice,
            realisedContractValue: item.RealizedPrice,
            paidRealisedContractValue: item.RealizedPaidPrice,
            deliveryDate: formatDate(item.DeliveryDate),
            scrapeDate: dateISO
        })) as RealisedInsert[];
    },

    insertData(db: DbOrTx, contracts: RealisedInsert[]): Promise<RealisedItem[]> {
        return insertRealisedContracts(db, contracts);
    },
    
    toDTO(contracts: RealisedItem[]): RealisedDTO[] {
        return toRealisedContractDTOList(contracts);
    }
}