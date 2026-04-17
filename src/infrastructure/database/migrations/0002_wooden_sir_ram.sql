CREATE EXTENSION IF NOT EXISTS unaccent;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.my_unaccent(input text)
RETURNS text
LANGUAGE SQL
IMMUTABLE
AS $$
	SELECT public.unaccent(input);
$$;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "awarded_contracting_institution_trgm_idx" ON "e_nabavki"."awarded_contracts" USING gin ((public.my_unaccent(lower(coalesce("contracting_institution", '')))) gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "awarded_contractor_trgm_idx" ON "e_nabavki"."awarded_contracts" USING gin ((public.my_unaccent(lower(coalesce("contractor", '')))) gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "institutions_name_trgm_idx" ON "e_nabavki"."institutions" USING gin ((public.my_unaccent(lower(coalesce("name", '')))) gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "realised_contracting_institution_trgm_idx" ON "e_nabavki"."realised_contracts" USING gin ((public.my_unaccent(lower(coalesce("contracting_institution", '')))) gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "realised_contractor_trgm_idx" ON "e_nabavki"."realised_contracts" USING gin ((public.my_unaccent(lower(coalesce("contractor", '')))) gin_trgm_ops);