/*
  Warnings:

  - The values [PLASTIC,PAPER,GLASS,METAL,METALCOPPER,ORGANIC,ELECTRONIC] on the enum `MaterialType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."MaterialType_new" AS ENUM ('PLASTICO', 'PAPEL', 'VIDRIO', 'METAL_COBRE', 'ORGANICO', 'ELECTRONICOS');
ALTER TABLE "public"."recyclable_materials" ALTER COLUMN "materialType" TYPE "public"."MaterialType_new" USING ("materialType"::text::"public"."MaterialType_new");
ALTER TYPE "public"."MaterialType" RENAME TO "MaterialType_old";
ALTER TYPE "public"."MaterialType_new" RENAME TO "MaterialType";
DROP TYPE "public"."MaterialType_old";
COMMIT;
