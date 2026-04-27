import { z } from 'zod';
import { paginationQuerySchema } from '../../../../shared/validation/PaginationQuery.schema.js';

const institutionsFilterSchema = z.object({
    name: z.string().max(255).optional(),
});

export const institutionsQuerySchema = institutionsFilterSchema.extend(
    paginationQuerySchema.shape,
);
