import { z } from 'zod';
import { paginationQuerySchema } from '../../../../shared/validation/PaginationQuery.schema.js';

const contractorsFilterSchema = z.object({
    name: z.string().max(255).optional(),
});

export const contractorsQuerySchema = contractorsFilterSchema.extend(
    paginationQuerySchema.shape,
);
