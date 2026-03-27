import type {DbOrTx} from "../../shared/types/Database.type";

export type Env = {
    Variables: {
        database: DbOrTx
    }
}