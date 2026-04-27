import { z } from 'zod';
import { buildSortablePaginationQuerySchema } from '../../../../shared/validation/PaginationQuery.schema.js';

const contractorsSortFields = [
    'id',
    'awardedContractsCount',
    'realisedContractsCount',
    'earnings',
] as const;

const contractorsFilterSchema = z.object({
    name: z.string().max(255).optional(),
    earnings: z.coerce.number().optional(),
    moreThanEarnings: z.coerce.number().optional(),
    lessThanEarnings: z.coerce.number().optional(),
    awardedContractsCount: z.coerce.number().optional(),
    moreThanAwardedContractsCount: z.coerce.number().optional(),
    lessThanAwardedContractsCount: z.coerce.number().optional(),
    realisedContractsCount: z.coerce.number().optional(),
    moreThanRealisedContractsCount: z.coerce.number().optional(),
    lessThanRealisedContractsCount: z.coerce.number().optional(),
});

export const contractorsQuerySchema = contractorsFilterSchema.extend(
    buildSortablePaginationQuerySchema(contractorsSortFields, 'id', 'asc')
        .shape,
);
