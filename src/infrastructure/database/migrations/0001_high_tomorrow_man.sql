ALTER TABLE "e_nabavki"."awarded_contracts" ALTER COLUMN "internal_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "e_nabavki"."changes_in_awarded_contracts" ALTER COLUMN "internal_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "e_nabavki"."realised_contracts" ALTER COLUMN "internal_id" SET NOT NULL;