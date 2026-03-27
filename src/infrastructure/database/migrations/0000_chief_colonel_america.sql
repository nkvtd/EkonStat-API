CREATE SCHEMA IF NOT EXISTS "e_nabavki";

CREATE TABLE "e_nabavki"."awarded_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"internal_id" text,
	"process_number" text,
	"realised_contract_id" integer,
	"num_changes" integer DEFAULT 0,
	"contracting_institution" text,
	"contracting_institution_id" integer,
	"contractor" text,
	"contractor_id" integer,
	"beneficial_owners" text,
	"small_contract" boolean,
	"subject" text,
	"type_contract" text,
	"type_contract_id" integer,
	"type_procedure" text,
	"type_procedure_id" integer,
	"type_offer" text,
	"type_offer_id" integer,
	"type_framework" text,
	"type_framework_agreement_id" integer,
	"estimated_contract_value" numeric,
	"original_contract_value" numeric,
	"assigned_contract_value" numeric,
	"assignment_date" timestamp with time zone,
	"latest_change_date" timestamp with time zone,
	"scrape_date" timestamp with time zone,
	CONSTRAINT "awarded_contracts_internal_id_unique" UNIQUE("internal_id")
);
--> statement-breakpoint
CREATE TABLE "e_nabavki"."changes_in_awarded_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"awarded_contract_id" integer,
	"internal_id" text,
	"process_number" text,
	"contracting_institution" text,
	"contracting_institution_id" integer,
	"contractor" text,
	"contractor_id" integer,
	"subject" text,
	"change_reason" text,
	"change_reason_id" integer,
	"assigned_contract_value" numeric,
	"updated_contract_value" numeric,
	"difference_in_value" numeric,
	"change_date" timestamp with time zone,
	"scrape_date" timestamp with time zone,
	CONSTRAINT "changes_in_awarded_contracts_internal_id_unique" UNIQUE("internal_id")
);
--> statement-breakpoint
CREATE TABLE "e_nabavki"."contractors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "contractors_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "e_nabavki"."institutions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "institutions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "e_nabavki"."realised_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"internal_id" text,
	"process_number" text,
	"contracting_institution" text,
	"contracting_institution_id" integer,
	"contractor" text,
	"contractor_id" integer,
	"subject" text,
	"type_contract" text,
	"type_contract_id" integer,
	"type_procedure" text,
	"type_procedure_id" integer,
	"type_offer" text,
	"type_offer_id" integer,
	"type_framework" text,
	"type_framework_agreement_id" integer,
	"assigned_contract_value" numeric,
	"contract_value" numeric,
	"paid_contract_value" numeric,
	"delivery_date" timestamp with time zone,
	"scrape_date" timestamp with time zone,
	CONSTRAINT "realised_contracts_internal_id_unique" UNIQUE("internal_id")
);
--> statement-breakpoint
ALTER TABLE "e_nabavki"."awarded_contracts" ADD CONSTRAINT "awarded_contracts_realised_contract_id_realised_contracts_id_fk" FOREIGN KEY ("realised_contract_id") REFERENCES "e_nabavki"."realised_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "e_nabavki"."awarded_contracts" ADD CONSTRAINT "awarded_contracts_contracting_institution_id_institutions_id_fk" FOREIGN KEY ("contracting_institution_id") REFERENCES "e_nabavki"."institutions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "e_nabavki"."awarded_contracts" ADD CONSTRAINT "awarded_contracts_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "e_nabavki"."contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "e_nabavki"."changes_in_awarded_contracts" ADD CONSTRAINT "changes_in_awarded_contracts_awarded_contract_id_awarded_contracts_id_fk" FOREIGN KEY ("awarded_contract_id") REFERENCES "e_nabavki"."awarded_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "e_nabavki"."changes_in_awarded_contracts" ADD CONSTRAINT "changes_in_awarded_contracts_contracting_institution_id_institutions_id_fk" FOREIGN KEY ("contracting_institution_id") REFERENCES "e_nabavki"."institutions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "e_nabavki"."changes_in_awarded_contracts" ADD CONSTRAINT "changes_in_awarded_contracts_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "e_nabavki"."contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "e_nabavki"."realised_contracts" ADD CONSTRAINT "realised_contracts_contracting_institution_id_institutions_id_fk" FOREIGN KEY ("contracting_institution_id") REFERENCES "e_nabavki"."institutions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "e_nabavki"."realised_contracts" ADD CONSTRAINT "realised_contracts_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "e_nabavki"."contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "awarded_match_cols_idx" ON "e_nabavki"."awarded_contracts" USING btree ("contracting_institution_id","contractor_id","original_contract_value","subject");--> statement-breakpoint
CREATE INDEX "awarded_realised_contract_id_idx" ON "e_nabavki"."awarded_contracts" USING btree ("realised_contract_id");--> statement-breakpoint
CREATE INDEX "changes_match_cols_idx" ON "e_nabavki"."changes_in_awarded_contracts" USING btree ("contracting_institution_id","contractor_id","assigned_contract_value","subject");--> statement-breakpoint
CREATE INDEX "changes_awarded_contract_id_idx" ON "e_nabavki"."changes_in_awarded_contracts" USING btree ("awarded_contract_id");--> statement-breakpoint
CREATE INDEX "realised_match_cols_idx" ON "e_nabavki"."realised_contracts" USING btree ("contracting_institution_id","contractor_id","assigned_contract_value","subject");