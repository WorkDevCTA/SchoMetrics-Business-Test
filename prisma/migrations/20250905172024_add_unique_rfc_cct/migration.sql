/*
  Warnings:

  - A unique constraint covering the columns `[rfc]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cct]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "profiles_rfc_key" ON "public"."profiles"("rfc");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_cct_key" ON "public"."profiles"("cct");
