import { z } from 'zod';
import { buildSortablePaginationQuerySchema } from '../../../../shared/validation/PaginationQuery.schema.js';

const awardedContractsSortFields = [
    'postDate',
    'estimatedContractValue',
    'assignedContractValue',
] as const;

const changesInAwardedSortFields = ['changeDate'] as const;

const awardedContractsFilterSchema = z.object({
    numChanges: z.coerce.number().int().nonnegative().optional(),
    institutionId: z.coerce.number().int().positive().optional(),
    institution: z.string().trim().min(1).max(255).optional(),
    contractorId: z.coerce.number().int().positive().optional(),
    contractor: z.string().trim().min(1).max(255).optional(),
    smallContract: z.stringbool().optional(),
    subject: z.string().max(255).optional(),
    typeContractId: z.coerce.number().int().positive().optional(),
    typeProcedureId: z.coerce.number().int().positive().optional(),
    typeOfferId: z.coerce.number().int().positive().optional(),
    typeFrameworkAgreementId: z.coerce.number().int().positive().optional(),
    lessThanAssignedValue: z.coerce.number().positive().optional(),
    moreThanAssignedValue: z.coerce.number().positive().optional(),
    beforePostDate: z.iso.datetime({ offset: true }).optional(),
    afterPostDate: z.iso.datetime({ offset: true }).optional(),
});

export const awardedContractsQuerySchema = awardedContractsFilterSchema.extend(
    buildSortablePaginationQuerySchema(
        awardedContractsSortFields,
        'postDate',
        'desc',
    ).shape,
);

export const awardedContractChangesQuerySchema =
    buildSortablePaginationQuerySchema(
        changesInAwardedSortFields,
        'changeDate',
        'desc',
    );
