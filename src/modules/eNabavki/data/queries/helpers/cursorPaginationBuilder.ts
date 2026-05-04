import { and, asc, desc, eq, gt, isNull, lt, or, type SQL, sql } from 'drizzle-orm';

type CursorValue = string | number | null;

export type CursorSortDirection = 'asc' | 'desc';

type CursorPayload<TSort extends string> = {
    sortBy: TSort;
    sortDirection: CursorSortDirection;
    value: CursorValue;
    id: number;
};

type CursorPaginationSortConfig<TRow> = {
    orderByColumn: unknown;
    cursorColumn?: unknown;
    getCursorValue: (row: TRow) => CursorValue;
};

type BuildCursorPaginationConfig<TRow, TSort extends string> = {
    cursor?: string | undefined;
    pageSize: number;
    sortBy?: TSort | undefined;
    sortDirection?: CursorSortDirection | undefined;
    defaultSortBy: TSort;
    defaultSortDirection?: CursorSortDirection | undefined;
    idColumn: unknown;
    sorts: Record<TSort, CursorPaginationSortConfig<TRow>>;
};

function encodeCursor<TSort extends string>(
    payload: CursorPayload<TSort>,
): string {
    return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function decodeCursor<TSort extends string>(
    cursor?: string,
): CursorPayload<TSort> | null {
    if (!cursor) return null;

    try {
        return JSON.parse(
            Buffer.from(cursor, 'base64url').toString('utf8'),
        ) as CursorPayload<TSort>;
    } catch {
        return null;
    }
}

export function buildCursorPagination<
    TRow extends { id: number },
    TSort extends string,
>(config: BuildCursorPaginationConfig<TRow, TSort>) {
    const sortBy =
        config.sortBy && config.sorts[config.sortBy]
            ? config.sortBy
            : config.defaultSortBy;

    const sortDirection =
        config.sortDirection ?? config.defaultSortDirection ?? 'desc';

    const sortConfig = config.sorts[sortBy];
    const decodedCursor = decodeCursor<TSort>(config.cursor);

    const cursor =
        decodedCursor &&
        decodedCursor.sortBy === sortBy &&
        decodedCursor.sortDirection === sortDirection
            ? decodedCursor
            : null;

    const invalidCursor = Boolean(config.cursor) && !cursor;

    const cursorColumn = sortConfig.cursorColumn ?? sortConfig.orderByColumn;
    const isIdOnlySort = sortConfig.orderByColumn === config.idColumn;

    const orderBy =
        sortDirection === 'asc'
            ? isIdOnlySort
                ? [asc(config.idColumn as never)]
                : [
                      asc(sortConfig.orderByColumn as never),
                      asc(config.idColumn as never),
                  ]
            : isIdOnlySort
              ? [desc(config.idColumn as never)]
              : [
                    sql`${sortConfig.orderByColumn} DESC NULLS LAST`,
                    desc(config.idColumn as never),
                ];

    const whereCursor = !cursor
        ? undefined
        : cursorColumn === config.idColumn
          ? sortDirection === 'asc'
              ? gt(config.idColumn as never, cursor.id as never)
              : lt(config.idColumn as never, cursor.id as never)
          : cursor.value === null
            ? and(
                  isNull(cursorColumn as never),
                  sortDirection === 'asc'
                      ? gt(config.idColumn as never, cursor.id as never)
                      : lt(config.idColumn as never, cursor.id as never),
              )
            : (or(
                  sortDirection === 'asc'
                      ? gt(cursorColumn as never, cursor.value as never)
                      : lt(cursorColumn as never, cursor.value as never),
                  isNull(cursorColumn as never),
                  and(
                      eq(cursorColumn as never, cursor.value as never),
                      sortDirection === 'asc'
                          ? gt(config.idColumn as never, cursor.id as never)
                          : lt(config.idColumn as never, cursor.id as never),
                  ),
              ) as SQL);

    function page(rows: TRow[]): TRow[] {
        return rows.slice(0, config.pageSize);
    }

    function nextCursor(rows: TRow[]): string | null {
        if (rows.length <= config.pageSize) return null;

        const lastItem = rows[config.pageSize - 1];
        if (!lastItem) return null;

        return encodeCursor({
            sortBy,
            sortDirection,
            value: sortConfig.getCursorValue(lastItem),
            id: lastItem.id,
        });
    }

    return {
        invalidCursor,
        sortBy,
        sortDirection,
        whereCursor,
        orderBy,
        limit: config.pageSize + 1,
        page,
        nextCursor,
    };
}
