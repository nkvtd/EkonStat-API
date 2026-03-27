import {db} from '../../infrastructure/database/db';

type Database = typeof db;

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

export type DbOrTx = Database | Transaction;