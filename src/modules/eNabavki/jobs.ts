import type {Job} from "../../shared/types/Job.type"; 
import {runStrategy} from "./scraping/strategyRunner";
import type {ScrapingStrategy} from "./scraping/strategies/Strategy.type";
import {realisedContractsStrategy} from "./scraping/strategies/realisedContractsStrategy";
import {awardedContractsStrategy} from "./scraping/strategies/awardedContractsStrategy";
import {changesInAwardedContractsStrategy} from "./scraping/strategies/changesInAwardedContractsStrategy";
import type {DbOrTx} from "../../shared/types/Database.type";

const strategies: ScrapingStrategy<any, any, any>[] = [
    realisedContractsStrategy,
    awardedContractsStrategy,
    changesInAwardedContractsStrategy
]

export const jobs: Job[] = strategies.map((s) => ({
    module: "eNabavki",
    name: s.name,
    schedule: s.schedule,
    task: async (database: DbOrTx) => runStrategy(database, s)
}));