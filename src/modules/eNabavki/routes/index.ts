import { Hono } from 'hono';
import type { Env } from '../../../infrastructure/server/Env.type.js';
import awardedContractsRoutes from './awardedContracts.routes.js';
import contractorRoutes from './contractors.routes.js';
import institutionsRoutes from './institutions.routes.js';
import realisedContractsRoutes from './realisedContracts.routes.js';
import statsRoutes from './stats.routes.js';

const eNabavkiRoutes = new Hono<Env>().basePath('/contracts');

eNabavkiRoutes.route('/awarded', awardedContractsRoutes);
eNabavkiRoutes.route('/realised', realisedContractsRoutes);
eNabavkiRoutes.route('/institutions', institutionsRoutes);
eNabavkiRoutes.route('/contractors', contractorRoutes);
eNabavkiRoutes.route('/stats', statsRoutes);

eNabavkiRoutes.get('/reference', (c) => {
    return c.json(
        {
            procedureTypes: {
                1: 'Отворена постапка',
                2: 'Ограничена постапка',
                3: 'Постапка со преговарање со претходно објавување на оглас',
                4: 'Конкурентен дијалог',
                5: 'Барање за прибирање понуди',
                6: 'Конкурс за избор на идејно решение',
                7: 'Постапка со преговарање без претходно објавување на оглас',
                8: 'Доделување на договор за јавна набавка за категорија на услуги 17-27',
                9: 'Оглас за воспоставување на квалификациски систем',
                10: 'Доделување на договор согласно член 10-а',
                13: 'Набавки од мала вредност',
                14: 'Поедноставена отворена постапка',
                15: 'Конкурентна постапка со преговарање',
                16: 'Партнерство за иновации',
                17: 'Посебни услуги',
                18: 'Член 24 - Јавни набавки меѓу договорниоргани',
                20: 'Посебни услуги (под 10.000/20.000 евра)',
            },
            offerTypes: {
                1: 'Најниска цена',
                2: 'Најдобра економска понуда',
                3: 'Ништо',
                4: 'Трошоците со користење на пристапот на исплатливост',
                5: 'Најдобар сооднос помеѓу цената и квалитетот',
            },
            frameworkAgreementTypes: {
                0: 'Без рамковен договор',
                1: 'Еден економски оператор',
                2: 'Повеќе економски оператори (повеќе кругови)',
                3: 'Повеќе економски оператори (еден круг)',
                4: 'Делумно повеќе економски оператори (еден круг)',
            },
            changeReasonTypes: {
                1: 'Промена на времетраење',
                2: 'Промена на вредност',
                3: 'Промена на времетраење и вредност',
            },
        },
        200,
    );
});

export default eNabavkiRoutes;
