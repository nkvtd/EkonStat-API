import { zValidator as zv } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import type * as z from 'zod';
import { fromZodError } from 'zod-validation-error';

export const zValidator = <
    T extends z.ZodSchema,
    Target extends keyof ValidationTargets,
>(
    target: Target,
    schema: T,
) =>
    zv(target, schema, (result, c) => {
        if (!result.success) {
            const prettyError = fromZodError(result.error).message.replace(
                'Validation error: ',
                '',
            );

            return c.json(
                {
                    message: prettyError,
                },
                400,
            );
        }

        return;
    });
