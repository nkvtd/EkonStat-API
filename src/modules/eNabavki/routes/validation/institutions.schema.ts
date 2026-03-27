import { z } from 'zod';
import { paginationSchema } from '../../../../shared/validation/Pagination.schema.js';

const institutionsFilterSchema = z.object({
    name: z.string().max(255).optional(),
});

export const institutionsQuerySchema = institutionsFilterSchema.extend(
    paginationSchema.shape,
);
