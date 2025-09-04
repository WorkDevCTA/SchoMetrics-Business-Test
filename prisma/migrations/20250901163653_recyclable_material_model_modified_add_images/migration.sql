/*
  Warnings:

  - You are about to drop the column `collectionDate` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `transporterInfo` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `evidenceUrls` on the `recyclable_materials` table. All the data in the column will be lost.
  - Added the required column `colleAmount` to the `purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalporterInfo` to the `purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transctionDate` to the `purchases` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."purchases" DROP COLUMN "collectionDate",
DROP COLUMN "totalAmount",
DROP COLUMN "transporterInfo",
ADD COLUMN     "colleAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalporterInfo" TEXT NOT NULL,
ADD COLUMN     "transctionDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."recyclable_materials" DROP COLUMN "evidenceUrls";

-- CreateTable
CREATE TABLE "public"."VisualMaterialImage" (
    "id" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "visualMaterialId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisualMaterialImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisualMaterialImage_visualMaterialId_idx" ON "public"."VisualMaterialImage"("visualMaterialId");

-- AddForeignKey
ALTER TABLE "public"."VisualMaterialImage" ADD CONSTRAINT "VisualMaterialImage_visualMaterialId_fkey" FOREIGN KEY ("visualMaterialId") REFERENCES "public"."recyclable_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
