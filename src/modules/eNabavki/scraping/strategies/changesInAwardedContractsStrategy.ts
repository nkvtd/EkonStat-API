import type { DbOrTx } from '../../../../shared/types/Database.type.js';
import {
    type ChangesInAwardedDTO,
    toChangesInAwardedContractDTOList,
} from '../../data/dto/ChangesInAwardedContract.dto.js';
import { CHANGE_REASON_MAP } from '../../data/enums.js';
import { insertChangesInAwardedContracts } from '../../data/queries/changesInAwardedContracts.query.js';
import type {
    ChangesInAwardedInsert,
    ChangesInAwardedItem,
} from '../../data/schema.js';
import { formatDate, getCurrentDateString } from '../../util/dates.js';
import { normaliseName } from '../../util/names.js';
import { buildBasePayload } from '../payloadBuilder.js';
import type { ScrapingContext, ScrapingStrategy } from './Strategy.type.js';

export const changesInAwardedContractsStrategy: ScrapingStrategy<
    ChangesInAwardedInsert,
    ChangesInAwardedItem,
    ChangesInAwardedDTO
> = {
    name: 'changes-in-awarded-contracts-processing',
    url: 'https://e-nabavki.gov.mk/Notifications/GetNotificationAccpPublicChangeGridData',

    buildPayload(context: ScrapingContext): URLSearchParams {
        return buildBasePayload({
            start: context.start,
            length: context.length,
            draw: context.draw,
            orderColumn: '11',
            columns: [
                'DecisionNumber',
                'CiName',
                'Subject',
                'ProcurementType',
                'TypeOfProcedureStr',
                'AssignementDate',
                'ProcureInChargePerson',
                'EstimatedValue',
                'AssignedContractValue',
                'AssignedValue',
                'DifferenceInAssignedValue',
                'AnnouncementDate',
                'Documents',
            ],
            specialColumns: ['Documents'],
            discriminator: {
                ContractingInstitution: null,
                ProcureInChargePerson: null,
                Status: '',
                MatterOfContract: '',
                CaOfProcurement: '',
                PeriodFrom: '01.01.2010',
                PeriodTo: getCurrentDateString(),
                NumberOfNotice: '',
                TypeOfPublicContract: '',
                TypeOfProcedure: '',
                ContractInstitution: '',
                DateContractFrom: '',
                DateContractTo: '',
            },
        });
    },

    // biome-ignore lint/suspicious/noExplicitAny: <response from the endpoint is not typed, and would require a lot of effort to type properly>
    parseResponse(response: any, dateISO: string): ChangesInAwardedInsert[] {
        // biome-ignore lint/suspicious/noExplicitAny: <response from the endpoint is not typed, and would require a lot of effort to type properly>
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
            differenceInValue:
                item.AssignedValue - item.AssignedContractValue > 0
                    ? item.DifferenceInAssignedValue * -1
                    : item.DifferenceInAssignedValue,
            changeDate: formatDate(item.CreationDate),
            scrapeDate: dateISO,
        })) as ChangesInAwardedInsert[];
    },

    insertData(
        db: DbOrTx,
        contracts: ChangesInAwardedInsert[],
    ): Promise<ChangesInAwardedItem[]> {
        return insertChangesInAwardedContracts(db, contracts);
    },

    mapToDTO(contracts: ChangesInAwardedItem[]): ChangesInAwardedDTO[] {
        return toChangesInAwardedContractDTOList(contracts);
    },
};
