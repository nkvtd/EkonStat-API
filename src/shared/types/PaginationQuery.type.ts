export type PaginationQuery = {
    cursor?: string | undefined;
    pageSize: number;
    sortBy?: string | undefined;
    sortDirection?: 'asc' | 'desc' | undefined;
} & Record<string, unknown>;
