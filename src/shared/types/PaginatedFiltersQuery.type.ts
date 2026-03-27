export type PaginatedFiltersQuery = {
    cursor: number;
    pageSize: number;
} & Record<string, unknown>;
