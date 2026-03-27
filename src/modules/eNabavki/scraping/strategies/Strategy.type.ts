import type { DbOrTx } from '../../../../shared/types/Database.type.js';

export type ScrapingContext = {
    start: number;
    length: number;
    draw: number;
};

export type ScrapingStrategy<TInsert, TItem, TDto> = {
    name: string;
    url: string;
    buildPayload: (context: ScrapingContext) => URLSearchParams;
    parseResponse: (response: unknown, dateISO: string) => TInsert[];
    insertData: (DbOrTx: DbOrTx, data: TInsert[]) => Promise<TItem[]>;
    mapToDTO: (items: TItem[]) => TDto[];
};
