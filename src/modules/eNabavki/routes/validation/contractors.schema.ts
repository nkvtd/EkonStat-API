import { z } from 'zod';
import { paginationSchema } from '../../../../shared/validation/Pagination.schema.js';

const contractorsFilterSchema = z.object({
    name: z.string().max(255).optional(),
});

export const contractorsQuerySchema = contractorsFilterSchema.extend(
    paginationSchema.shape,
);
