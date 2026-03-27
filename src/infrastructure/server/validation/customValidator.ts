import * as z from 'zod'
import type { ValidationTargets } from 'hono'
import { zValidator as zv } from '@hono/zod-validator'

export const zValidator = <T extends z.ZodSchema, Target extends keyof ValidationTargets>(
    target: Target,
    schema: T
) =>
    zv(target, schema, (result, c) => {
        if (!result.success) {
            const prettyError = z.prettifyError(result.error);
            
            return c.json({
                message: prettyError,
            }, 400);
        }
    })