import {
    pgTable,
    serial,
    integer,
    text,
    numeric,
    boolean,
    timestamp, pgSchema, index
} from "drizzle-orm/pg-core";

const eNabavkiSchema = pgSchema("e_nabavki");

export const institutionsTable = eNabavkiSchema.table("institutions", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique()
});

export const contractorsTable = eNabavkiSchema.table("contractors", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique()
});

export const realisedTable = eNabavkiSchema.table("realised_contracts", {
    id: serial("id").primaryKey(),
    internalId: text("internal_id").unique(), //Id
    processNumber: text("process_number"), //ProcessNumber
    contractingInstitution: text("contracting_institution"), //Name
    contractingInstitutionId: integer("contracting_institution_id")
        .references(() => institutionsTable.id),
    contractor: text("contractor"), //ProcureInChargePerson
    contractorId: integer("contractor_id")
        .references(() => contractorsTable.id),
    subject: text("subject"), //Subject
    typeContract: text("type_contract"), //TypeOfProcurement
    typeContractId: integer("type_contract_id"),
    typeProcedure: text("type_procedure"), //RelatedProcedureType
    typeProcedureId: integer("type_procedure_id"),
    typeOffer: text("type_offer"), //OfferTypeId
    typeOfferId: integer("type_offer_id"),
    typeFrameworkAgreement: text("type_framework"), //FrameworkType
    typeFrameworkAgreementId: integer("type_framework_agreement_id"),
    assignedContractValue: numeric("assigned_contract_value"), //AssignedPrice
    realisedContractValue: numeric("contract_value"), //RealizedPrice
    paidRealisedContractValue: numeric("paid_contract_value"), //RealizedPaidPrice
    deliveryDate: timestamp("delivery_date", { withTimezone: true, mode: "string" }), //DeliveryDate
    scrapeDate: timestamp("scrape_date", { withTimezone: true, mode: "string" })
}, (table) => [
    index("realised_match_cols_idx")
        .on(table.contractingInstitutionId, table.contractorId, table.assignedContractValue, table.subject)
]);

export const awardedTable = eNabavkiSchema.table("awarded_contracts", {
    id: serial("id").primaryKey(),
    internalId: text("internal_id").unique(), //Id
    processNumber: text("process_number"), //ProcessNumber
    realisedContractId: integer("realised_contract_id")
        .references(() => realisedTable.id),
    numChanges: integer("num_changes").default(0),
    contractingInstitution: text("contracting_institution"), //ContractingInstitutionName
    contractingInstitutionId: integer("contracting_institution_id")
        .references(() => institutionsTable.id),
    contractor: text("contractor"), //VendorName
    contractorId: integer("contractor_id")
        .references(() => contractorsTable.id),
    beneficialOwners: text("beneficial_owners"), //BeneficialOwners
    smallContract: boolean("small_contract"), //IsSmallPublicProcurement
    subject: text("subject"), //Subject
    typeContract: text("type_contract"), //ProcurementTypeId
    typeContractId: integer("type_contract_id"),
    typeProcedure: text("type_procedure"), //ProcedureTypeId
    typeProcedureId: integer("type_procedure_id"),
    typeOffer: text("type_offer"), //OfferTypeId
    typeOfferId: integer("type_offer_id"),
    typeFrameworkAgreement: text("type_framework"), //FrameworkType
    typeFrameworkAgreementId: integer("type_framework_agreement_id"),
    estimatedContractValue: numeric("estimated_contract_value"), //EstimatedPrice
    originalContractValue: numeric("original_contract_value"), //AssignedPrice
    assignedContractValue: numeric("assigned_contract_value"), //AssignedPrice
    assignmentDate: timestamp("assignment_date", { withTimezone: true, mode: "string" }), //AssignementDate
    latestChangeDate: timestamp("latest_change_date", { withTimezone: true, mode: "string" }),
    scrapeDate: timestamp("scrape_date", { withTimezone: true, mode: "string" })
}, (table) => [
    index("awarded_match_cols_idx")
        .on(table.contractingInstitutionId, table.contractorId, table.originalContractValue, table.subject),
    index("awarded_realised_contract_id_idx")
        .on(table.realisedContractId)
]);

export const changesInAwardedTable = eNabavkiSchema.table("changes_in_awarded_contracts", {
    id: serial("id").primaryKey(),
    awardedContractId: integer("awarded_contract_id")
        .references(() => awardedTable.id),
    internalId: text("internal_id").unique(), //Id
    processNumber: text("process_number"), //DecisionNumber
    contractingInstitution: text("contracting_institution"), //CiName
    contractingInstitutionId: integer("contracting_institution_id")
        .references(() => institutionsTable.id),
    contractor: text("contractor"), //ProcureInChargePerson
    contractorId: integer("contractor_id")
        .references(() => contractorsTable.id),
    subject: text("subject"), //Subject
    changeReason: text("change_reason"), //GroundForChange
    changeReasonId: integer("change_reason_id"),
    assignedContractValue: numeric("assigned_contract_value"), //AssignedValue
    updatedContractValue: numeric("updated_contract_value"), //AssignedContractValue
    differenceInValue: numeric("difference_in_value"), //DifferenceInAssignedValue
    changeDate: timestamp("change_date", { withTimezone: true, mode: "string" }), //CreationDate
    scrapeDate: timestamp("scrape_date", { withTimezone: true, mode: "string" })
}, (table) => [
    index("changes_match_cols_idx")
        .on(table.contractingInstitutionId, table.contractorId, table.assignedContractValue, table.subject),
    index("changes_awarded_contract_id_idx")
        .on(table.awardedContractId)
]);

export type RealisedItem = typeof realisedTable.$inferSelect;
export type RealisedInsert = typeof realisedTable.$inferInsert;

export type AwardedItem = typeof awardedTable.$inferSelect;
export type AwardedInsert = typeof awardedTable.$inferInsert;

export type ChangesInAwardedItem = typeof changesInAwardedTable.$inferSelect;
export type ChangesInAwardedInsert = typeof changesInAwardedTable.$inferInsert;

export type InstitutionItem = typeof institutionsTable.$inferSelect;
export type InstitutionInsert = typeof institutionsTable.$inferInsert;

export type ContractorItem = typeof contractorsTable.$inferSelect;
export type ContractorInsert = typeof contractorsTable.$inferInsert;
