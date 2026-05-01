import { z } from 'zod';
import { buildSortablePaginationQuerySchema } from '../../../../shared/validation/PaginationQuery.schema.js';

const realisedContractsSortFields = [
    'postDate',
    'assignedContractValue',
    'realisedContractValue',
    'paidRealisedContractValue',
] as const;

const realisedContractsFilterSchema = z.object({
    institutionId: z.coerce.number().int().positive().optional(),
    institution: z.string().trim().min(1).max(255).optional(),
    contractorId: z.coerce.number().int().positive().optional(),
    contractor: z.string().trim().min(1).max(255).optional(),
    subject: z.string().max(255).optional(),
    typeContractId: z.coerce.number().int().positive().optional(),
    typeProcedureId: z.coerce.number().int().positive().optional(),
    typeOfferId: z.coerce.number().int().positive().optional(),
    typeFrameworkAgreementId: z.coerce.number().int().positive().optional(),
    lessThanAssignedValue: z.coerce.number().positive().optional(),
    moreThanAssignedValue: z.coerce.number().positive().optional(),
    lessThanRealisedValue: z.coerce.number().positive().optional(),
    moreThanRealisedValue: z.coerce.number().positive().optional(),
    postDate: z.iso.datetime({ offset: true }).optional(),
});

export const realisedContractsQuerySchema =
    realisedContractsFilterSchema.extend(
        buildSortablePaginationQuerySchema(
            realisedContractsSortFields,
            'postDate',
            'desc',
        ).shape,
    );
