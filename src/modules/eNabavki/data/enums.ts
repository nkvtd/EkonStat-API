export const CONTRACT_TYPE_MAP: Record<string, string> = {
    '': 'Сите',
    '1': 'Стоки',
    '2': 'Услуги',
    '3': 'Работи',
};

export const PROCEDURE_TYPE_MAP: Record<string, string> = {
    '': 'Сите', // ALL
    '1': 'Отворена постапка', // OPEN
    '2': 'Ограничена постапка', // RESTRICTED
    '3': 'Постапка со преговарање со претходно објавување на оглас', // PROCEDUREFORTALKINGWITHPREVIOUSANNOUNCEMENT
    '4': 'Конкурентен дијалог', // COMPETITIVEDIALOGUE
    '5': 'Барање за прибирање понуди', // REQUESTFORPROPOSAL
    '6': 'Конкурс за избор на идејно решение', // BIDFORCHOOSINGIDEALSOLUTION
    '7': 'Постапка со преговарање без претходно објавување на оглас', // PROCEDUREFORTALKINGWITHOUTPREVIOUSANNOUNCEMENT
    '8': 'Доделување на договор за јавна набавка за категорија на услуги 17-27', // ASSIGNINGCONTRACTFORPUBLICPROCURESERVICES1727
    '9': 'Оглас за воспоставување на квалификациски систем', // QUALIFICATIONSYSTEM
    '10': 'Доделување на договор согласно член 10-а', // ACCORDINGTOSTATEMENT10A
    '11': '/',
    '12': '/',
    '13': 'Набавки од мала вредност', // LowEstimatedValueProcedure
    '14': 'Поедноставена отворена постапка', // SimplifiedOpenProcedure
    '15': 'Конкурентна постапка со преговарање', // ConcurrentNegotiation
    '16': 'Партнерство за иновации', // InovationalPartnership
    '17': 'Посебни услуги', // SpecialServices
    '18': 'Член 24 - Јавни набавки меѓу договорни органи', // Statement24
    '19': '/',
    '20': 'Посебни услуги (под 10.000/20.000 евра)', // SpecialServicesForQuartalEvidence
};

export const OFFER_TYPE_MAP: Record<string, string> = {
    '1': 'Најниска цена', //LOWESTPRICE
    '2': 'Најдобра економска понуда', //BESTECONOMICOFFER
    '3': 'Ништо', //NONE
    '4': 'Трошоците со користење на пристапот на исплатливост', //COSTEFFECTIVENESS
    '5': 'Најдобар сооднос помеѓу цената и квалитетот', //PRICEQUALITYRATIO
};

export const FRAMEWORK_AGREEMENT_TYPE: Record<string, string> = {
    '0': 'Без рамковен договор', //WithoutFrameworkAgreement
    '1': 'Еден економски оператор', //OneEconomicOperator
    '2': 'Повеќе економски оператори (повеќе кругови)', //MoreEconomicOperatorsMultipleCircle
    '3': 'Повеќе економски оператори (еден круг)', //MoreEconomicOperatorsOneCircle
    '4': 'Делумно повеќе економски оператори (еден круг)', //PartialMoreEconomicOperatorsOneCircle
};

export const CHANGE_REASON_MAP: Record<string, string> = {
    '1': 'Промена на времетраење', //ChangeOfDuration
    '2': 'Промена на вредност', //ChangeOfValue
    '3': 'Промена на времетраење и вредност', //ChangeOfDurationAndValue
};
