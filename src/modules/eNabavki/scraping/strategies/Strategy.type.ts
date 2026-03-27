import type {ENABAVKI_EVENTS_TYPE} from "../../data/events";
import type {DbOrTx} from "../../../../shared/types/Database.type";

export type ScrapingStrategy<TInsert, TItem, TDto> = {
    name: string;
    schedule: string;
    url: string;
    event: ENABAVKI_EVENTS_TYPE;
    buildPayload: () => URLSearchParams;
    parseResponse: (response: any, dateISO: string) => TInsert[];
    insertData: (DbOrTx: DbOrTx, data: TInsert[]) => Promise<TItem[]>;
    toDTO: (items: TItem[]) => TDto[];
};
