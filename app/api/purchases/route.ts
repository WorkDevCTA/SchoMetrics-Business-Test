import { type NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { openpay } from "@/lib/openpay";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session?.userType !== "COMPANY") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const {
      recyclableMaterialId,
      companyName,
      companyRfc,
      companyAddress,
      companyPhone,
      transporterName,
      transporterPhone,
      transporterInfo,
      collectionDate,
      totalAmount,
      customerName,
      customerEmail,
      userId,
    } = data;

    // Check if material is still available
    const material = await prisma.recyclableMaterial.findUnique({
      where: { id: recyclableMaterialId },
    });

    if (!material || material.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: "Material no disponible" },
        { status: 400 }
      );
    }

    // Generate folio number
    const folioNumber = nanoid(12).toUpperCase();

    // Create purchase record
    const purchase = await prisma.purchase.create({
      data: {
        folioNumber,
        companyName,
        companyRfc,
        companyAddress,
        companyPhone,
        transporterName,
        transporterPhone,
        transporterInfo,
        collectionDate: new Date(collectionDate),
        totalAmount,
        userId,
        recyclableMaterialId,
        paymentStatus: "PENDING",
      },
    });

    // Create Openpay charge
    try {
      const charge = await openpay.createCharge({
        amount: totalAmount,
        description: `Compra de material reciclable - ${material.title}`,
        customer: {
          name: customerName,
          email: customerEmail,
        },
        orderId: purchase.id,
      });

      // Update purchase with payment ID
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { paymentId: charge.id },
      });

      // For demo purposes, simulate successful payment
      // In real implementation, this would be handled by webhooks
      setTimeout(async () => {
        try {
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: { paymentStatus: "COMPLETED" },
          });

          await prisma.recyclableMaterial.update({
            where: { id: recyclableMaterialId },
            data: { status: "PURCHASED" },
          });
        } catch (error) {
          console.error("Error updating payment status:", error);
        }
      }, 2000);

      return NextResponse.json({
        purchase,
        paymentUrl: charge.payment_method?.url,
      });
    } catch (error) {
      // Delete purchase if payment creation fails
      await prisma.purchase.delete({ where: { id: purchase.id } });
      throw error;
    }
  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
