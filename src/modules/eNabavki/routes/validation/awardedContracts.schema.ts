import { z } from 'zod';
import {paginationSchema} from "../../../../shared/validation/Pagination.schema";

const awardedContractsFilterSchema = z.object({
    numChanges: z.coerce.number().int().nonnegative().optional(),
    institutionId: z.coerce.number().int().positive().optional(),
    contractorId: z.coerce.number().int().positive().optional(),
    smallContract: z.coerce.boolean().optional(),
    subject: z.string().optional(),
    typeContractId: z.coerce.number().int().positive().optional(),
    typeProcedureId: z.coerce.number().int().positive().optional(),
    typeOfferId: z.coerce.number().int().positive().optional(),
    typeFrameworkAgreementId: z.coerce.number().int().positive().optional(),
    lessThanAssignedValue: z.coerce.number().positive().optional(),
    moreThanAssignedValue: z.coerce.number().positive().optional(),
    assignmentDate: z.iso.datetime({ offset: true }).optional(),
});

export const awardedContractsQuerySchema = awardedContractsFilterSchema.extend(paginationSchema.shape);
