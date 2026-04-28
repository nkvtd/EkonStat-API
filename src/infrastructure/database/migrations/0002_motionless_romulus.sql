CREATE EXTENSION IF NOT EXISTS unaccent;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint

ALTER TABLE "e_nabavki"."awarded_contracts" RENAME COLUMN "assignment_date" TO "post_date";--> statement-breakpoint
ALTER TABLE "e_nabavki"."realised_contracts" RENAME COLUMN "delivery_date" TO "post_date";--> statement-breakpoint
ALTER TABLE "e_nabavki"."contractors" ADD COLUMN "awarded_contracts_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "e_nabavki"."contractors" ADD COLUMN "realised_contracts_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "e_nabavki"."contractors" ADD COLUMN "earnings" numeric;--> statement-breakpoint
ALTER TABLE "e_nabavki"."institutions" ADD COLUMN "awarded_contracts_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "e_nabavki"."institutions" ADD COLUMN "realised_contracts_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "e_nabavki"."institutions" ADD COLUMN "spendings" numeric;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.my_unaccent(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
STRICT
AS $$
BEGIN
  RETURN public.unaccent('public.unaccent', input);
END;
$$;--> statement-breakpoint

CREATE INDEX "awarded_contracting_institution_trgm_idx" ON "e_nabavki"."awarded_contracts" USING gin (((public.my_unaccent(lower(coalesce("contracting_institution", '')))) gin_trgm_ops));--> statement-breakpoint
CREATE INDEX "awarded_contractor_trgm_idx" ON "e_nabavki"."awarded_contracts" USING gin (((public.my_unaccent(lower(coalesce("contractor", '')))) gin_trgm_ops));--> statement-breakpoint
CREATE INDEX "contractors_name_trgm_idx" ON "e_nabavki"."contractors" USING gin (((public.my_unaccent(lower(coalesce("name", '')))) gin_trgm_ops));--> statement-breakpoint
CREATE INDEX "institutions_name_trgm_idx" ON "e_nabavki"."institutions" USING gin (((public.my_unaccent(lower(coalesce("name", '')))) gin_trgm_ops));--> statement-breakpoint
CREATE INDEX "realised_contracting_institution_trgm_idx" ON "e_nabavki"."realised_contracts" USING gin (((public.my_unaccent(lower(coalesce("contracting_institution", '')))) gin_trgm_ops));--> statement-breakpoint
CREATE INDEX "realised_contractor_trgm_idx" ON "e_nabavki"."realised_contracts" USING gin (((public.my_unaccent(lower(coalesce("contractor", '')))) gin_trgm_ops));