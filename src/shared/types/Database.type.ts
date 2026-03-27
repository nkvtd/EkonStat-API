import type { db } from '../../infrastructure/database/db.js';

type Database = typeof db;

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type DbOrTx = Database | Transaction;
