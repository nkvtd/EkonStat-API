import type { DbOrTx } from '../../../../shared/types/Database.type.js';
import {
    type RealisedContractDTO,
    toRealisedContractDTOList,
} from '../../data/dto/RealisedContract.dto.js';
import {
    CONTRACT_TYPE_MAP,
    FRAMEWORK_AGREEMENT_TYPE,
    OFFER_TYPE_MAP,
    PROCEDURE_TYPE_MAP,
} from '../../data/enums.js';
import { insertRealisedContracts } from '../../data/queries/realisedContracts.query.js';
import type { RealisedInsert, RealisedItem } from '../../data/schema.js';
import { formatDate, getCurrentDateString } from '../../util/dates.js';
import { normaliseName } from '../../util/names.js';
import { buildBasePayload } from '../payloadBuilder.js';
import type { ScrapingContext, ScrapingStrategy } from './Strategy.type.js';

export const realisedContractsStrategy: ScrapingStrategy<
    RealisedInsert,
    RealisedItem,
    RealisedContractDTO
> = {
    name: 'realised-contracts-processing',
    url: 'https://e-nabavki.gov.mk/Services/NotificationRealizedContract.asmx/GetGridData',

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
    parseResponse(response: any, dateISO: string): RealisedInsert[] {
        // biome-ignore lint/suspicious/noExplicitAny: <response from the endpoint is not typed, and would require a lot of effort to type properly>
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
            typeFrameworkAgreement:
                FRAMEWORK_AGREEMENT_TYPE[item.FrameworkType],
            typeFrameworkAgreementId: item.FrameworkType,
            assignedContractValue: item.AssignedPrice,
            realisedContractValue: item.RealizedPrice,
            paidRealisedContractValue: item.RealizedPaidPrice,
            postDate: formatDate(item.DeliveryDate),
            scrapeDate: dateISO,
        })) as RealisedInsert[];
    },

    insertData(
        db: DbOrTx,
        contracts: RealisedInsert[],
    ): Promise<RealisedItem[]> {
        return insertRealisedContracts(db, contracts);
    },

    mapToDTO(contracts: RealisedItem[]): RealisedContractDTO[] {
        return toRealisedContractDTOList(contracts);
    },
};
