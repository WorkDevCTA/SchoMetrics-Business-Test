-- CreateEnum
CREATE TYPE "public"."MaterialType" AS ENUM ('PLASTIC', 'PAPER', 'GLASS', 'METAL', 'METALCOPPER', 'ORGANIC', 'ELECTRONIC');

-- CreateEnum
CREATE TYPE "public"."MaterialStatus" AS ENUM ('AVAILABLE', 'PURCHASED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."recyclable_materials" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "materialType" "public"."MaterialType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "schedule" TEXT NOT NULL,
    "evidenceUrls" TEXT[],
    "status" "public"."MaterialStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "recyclable_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchases" (
    "id" TEXT NOT NULL,
    "folioNumber" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyRfc" TEXT NOT NULL,
    "companyAddress" TEXT NOT NULL,
    "companyPhone" TEXT NOT NULL,
    "transporterName" TEXT NOT NULL,
    "transporterPhone" TEXT NOT NULL,
    "transporterInfo" TEXT NOT NULL,
    "collectionDate" TIMESTAMP(3) NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "recyclableMaterialId" TEXT NOT NULL,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "purchases_folioNumber_key" ON "public"."purchases"("folioNumber");

-- AddForeignKey
ALTER TABLE "public"."recyclable_materials" ADD CONSTRAINT "recyclable_materials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_recyclableMaterialId_fkey" FOREIGN KEY ("recyclableMaterialId") REFERENCES "public"."recyclable_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
