import {Hono} from "hono";
import awardedContractsRoutes from "./awardedContracts.routes";
import realisedContractsRoutes from "./realisedContracts.route";

const eNabavkiRoutes = new Hono();

eNabavkiRoutes.route('/awarded', awardedContractsRoutes);
eNabavkiRoutes.route('/realised', realisedContractsRoutes);

export default eNabavkiRoutes;