export type PaginatedResult<T> = {
    data: T[];
    nextCursor: string | null;
    invalidCursor: boolean;
};
