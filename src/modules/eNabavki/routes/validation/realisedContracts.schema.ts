import { z } from 'zod';
import { paginationSchema } from '../../../../shared/validation/Pagination.schema.js';

const realisedContractsFilterSchema = z.object({
    institutionId: z.coerce.number().int().positive().optional(),
    contractorId: z.coerce.number().int().positive().optional(),
    subject: z.string().max(255).optional(),
    typeContractId: z.coerce.number().int().positive().optional(),
    typeProcedureId: z.coerce.number().int().positive().optional(),
    typeOfferId: z.coerce.number().int().positive().optional(),
    typeFrameworkAgreementId: z.coerce.number().int().positive().optional(),
    lessThanAssignedValue: z.coerce.number().positive().optional(),
    moreThanAssignedValue: z.coerce.number().positive().optional(),
    lessThanRealisedValue: z.coerce.number().positive().optional(),
    moreThanRealisedValue: z.coerce.number().positive().optional(),
    deliveryDate: z.iso.datetime({ offset: true }).optional(),
});

export const realisedContractsQuerySchema =
    realisedContractsFilterSchema.extend(paginationSchema.shape);
