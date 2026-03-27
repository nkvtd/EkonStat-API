import { z } from "zod";

export const paginationSchema = z.object({
    cursor: z.coerce.number().int().min(0).optional().default(0),
    pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
});