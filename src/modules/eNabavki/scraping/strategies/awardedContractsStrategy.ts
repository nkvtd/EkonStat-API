import type { DbOrTx } from '../../../../shared/types/Database.type.js';
import {
    type AwardedDTO,
    toAwardedContractDTOList,
} from '../../data/dto/AwardedContract.dto.js';
import {
    CONTRACT_TYPE_MAP,
    FRAMEWORK_AGREEMENT_TYPE,
    OFFER_TYPE_MAP,
    PROCEDURE_TYPE_MAP,
} from '../../data/enums.js';
import { insertAwardedContracts } from '../../data/queries/awardedContracts.query.js';
import type { AwardedInsert, AwardedItem } from '../../data/schema.js';
import { formatDate, getCurrentDateString } from '../../util/dates.js';
import { normaliseName } from '../../util/names.js';
import { buildBasePayload } from '../payloadBuilder.js';
import type { ScrapingContext, ScrapingStrategy } from './Strategy.type.js';

export const awardedContractsStrategy: ScrapingStrategy<
    AwardedInsert,
    AwardedItem,
    AwardedDTO
> = {
    name: 'awarded-contracts-processing',
    url: 'https://e-nabavki.gov.mk/Services/AcceptanceNotifications.asmx/GetGridData',

    buildPayload(context: ScrapingContext): URLSearchParams {
        return buildBasePayload({
            start: context.start,
            length: context.length,
            draw: context.draw,
            orderColumn: '9',
            columns: [
                'ProcessNumber',
                'ContractingInstitutionName',
                'Subject',
                'ProcurementType',
                'ProcedureType',
                'AssignementDate',
                'PersonInCharge',
                'EstimatedPrice',
                'AssignedPrice',
                'AnnouncementDate',
                'BeneficialOwners',
                'Documents',
            ],
            specialColumns: ['BeneficialOwners', 'Documents'],
            discriminator: {
                ContractingInstitution: { id: 0, text: '' },
                VendorMB: '',
                ProcessNumber: '',
                ContractingInstitutionName: null,
                PeriodFrom: '01.01.2010',
                PeriodTo: getCurrentDateString(),
                DateContractFrom: '',
                DateContractTo: '',
                Subject: '',
                Contractor: '',
                TypeOfPublicContracts: '',
                TypeOfProcedure: '',
                IsCovid: false,
                OfferType: '',
                IsTerminated: '',
                BeneficialOwnerFullName: '',
                ProcureInChargePerson: null,
            },
        });
    },

    // biome-ignore lint/suspicious/noExplicitAny: <response from the endpoint is not typed, and would require a lot of effort to type properly>
    parseResponse(response: any, dateISO: string): AwardedInsert[] {
        // biome-ignore lint/suspicious/noExplicitAny: <response from the endpoint is not typed, and would require a lot of effort to type properly>
        return response.data.map((item: any) => ({
            internalId: item.Id,
            processNumber: item.ProcessNumber,
            contractingInstitution: normaliseName(
                item.ContractingInstitutionName,
            ),
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
            typeFrameworkAgreement:
                FRAMEWORK_AGREEMENT_TYPE[item.FrameworkType],
            typeFrameworkAgreementId: item.FrameworkType,
            estimatedContractValue: item.EstimatedPrice,
            originalContractValue: item.AssignedPrice,
            assignedContractValue: item.AssignedPrice,
            assignmentDate: formatDate(item.AssignementDate),
            latestChangeDate: formatDate(item.AssignementDate),
            scrapeDate: dateISO,
        })) as AwardedInsert[];
    },

    insertData(db: DbOrTx, contracts: AwardedInsert[]): Promise<AwardedItem[]> {
        return insertAwardedContracts(db, contracts);
    },

    mapToDTO(contracts: AwardedItem[]): AwardedDTO[] {
        return toAwardedContractDTOList(contracts);
    },
};
