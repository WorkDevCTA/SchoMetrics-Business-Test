/*
  Warnings:

  - You are about to drop the column `latitude` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."profiles" DROP COLUMN "latitude",
DROP COLUMN "longitude";
