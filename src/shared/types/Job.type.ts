import type {DbOrTx} from "./Database.type";

export type Job = {
    module: string
    name: string
    schedule: string
    task: (db: DbOrTx) => Promise<void>
}