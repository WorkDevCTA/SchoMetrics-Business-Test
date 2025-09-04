/*
  Warnings:

  - You are about to drop the `VisualMaterialImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."VisualMaterialImage" DROP CONSTRAINT "VisualMaterialImage_visualMaterialId_fkey";

-- DropTable
DROP TABLE "public"."VisualMaterialImage";

-- CreateTable
CREATE TABLE "public"."RecyclableMaterialImage" (
    "id" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "RecyclableMaterialId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecyclableMaterialImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecyclableMaterialImage_RecyclableMaterialId_idx" ON "public"."RecyclableMaterialImage"("RecyclableMaterialId");

-- AddForeignKey
ALTER TABLE "public"."RecyclableMaterialImage" ADD CONSTRAINT "RecyclableMaterialImage_RecyclableMaterialId_fkey" FOREIGN KEY ("RecyclableMaterialId") REFERENCES "public"."recyclable_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
