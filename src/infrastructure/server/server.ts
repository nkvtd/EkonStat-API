import {Hono} from "hono";
import { logger as honoLogger } from 'hono/logger';
import { cors } from 'hono/cors';
import {prettyJSON} from "hono/pretty-json";
import {secureHeaders} from "hono/secure-headers";
import { trimTrailingSlash } from 'hono/trailing-slash';
import eNabavkiRoutes from "../../modules/eNabavki/routes";
import {dbMiddleware} from "./middleware/dbMiddleware";
import type {Env} from "./Env.type";
import {logger} from "../logging/logger";

const app = new Hono<Env>().basePath('/api');

app.use(honoLogger());
app.use(secureHeaders());
app.use(cors());
app.use(prettyJSON());
app.use(dbMiddleware);
app.use(trimTrailingSlash());

app.get('/health', (c) => {
    return c.json({
        message: 'OK'
    }, 200);
});


app.route('/contracts', eNabavkiRoutes);

app.onError((err, c) => {
    logger.error(`Unexpected server error: ${err.message}`, { stack: err.stack });

    return c.json({ 
        message: 'Internal server error'
    }, 500);
});

export default app;