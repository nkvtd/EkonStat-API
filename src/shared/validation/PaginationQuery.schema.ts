import { z } from 'zod';

export const paginationQuerySchema = z.object({
    cursor: z.string().trim().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export function buildSortablePaginationQuerySchema<
    const TSortFields extends readonly [string, ...string[]],
>(
    sortFields: TSortFields,
    defaultSortBy: TSortFields[number],
    defaultSortDirection: 'asc' | 'desc' = 'desc',
) {
    return paginationQuerySchema.extend({
        sortBy: z.enum(sortFields).optional().default(defaultSortBy),
        sortDirection: z
            .enum(['asc', 'desc'])
            .optional()
            .default(defaultSortDirection),
    });
}
