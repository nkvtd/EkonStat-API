import { z } from 'zod';
import { buildSortablePaginationQuerySchema } from '../../../../shared/validation/PaginationQuery.schema.js';

const institutionsSortFields = [
    'id',
    'awardedContractsCount',
    'realisedContractsCount',
    'spendings',
] as const;

const institutionsFilterSchema = z.object({
    name: z.string().max(255).optional(),
    spendings: z.coerce.number().optional(),
    moreThanSpendings: z.coerce.number().optional(),
    lessThanSpendings: z.coerce.number().optional(),
    awardedContractsCount: z.coerce.number().optional(),
    moreThanAwardedContractsCount: z.coerce.number().optional(),
    lessThanAwardedContractsCount: z.coerce.number().optional(),
    realisedContractsCount: z.coerce.number().optional(),
    moreThanRealisedContractsCount: z.coerce.number().optional(),
    lessThanRealisedContractsCount: z.coerce.number().optional(),
});

export const institutionsQuerySchema = institutionsFilterSchema.extend(
    buildSortablePaginationQuerySchema(institutionsSortFields, 'id', 'asc')
        .shape,
);
