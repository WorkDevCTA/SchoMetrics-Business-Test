import prisma from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: params.purchaseId },
      include: {
        recyclableMaterial: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Compra no encontrada" },
        { status: 404 }
      );
    }

    if (purchase.paymentStatus !== "COMPLETED") {
      return NextResponse.json(
        { error: "Pago no completado" },
        { status: 400 }
      );
    }

    // Generate PDF receipt (simplified for demo)
    const receiptData = {
      folioNumber: purchase.folioNumber,
      companyName: purchase.companyName,
      companyRfc: purchase.companyRfc,
      companyAddress: purchase.companyAddress,
      companyPhone: purchase.companyPhone,
      transporterName: purchase.transporterName,
      transporterPhone: purchase.transporterPhone,
      transporterInfo: purchase.transporterInfo,
      collectionDate: purchase.collectionDate,
      totalAmount: purchase.totalAmount,
      materialTitle: purchase.recyclableMaterial.title,
      materialType: purchase.recyclableMaterial.materialType,
      materialQuantity: purchase.recyclableMaterial.quantity,
      schoolName: purchase.recyclableMaterial.user.name,
      schoolEmail: purchase.recyclableMaterial.user.profile?.email,
      createdAt: purchase.createdAt,
    };

    // In a real implementation, you would use a PDF library like jsPDF or Puppeteer
    // For demo purposes, return JSON data
    const pdfContent = `
      COMPROBANTE DE COMPRA - SCHOMETRICS
      
      Folio: ${receiptData.folioNumber}
      Fecha: ${new Date(receiptData.createdAt).toLocaleDateString("es-MX")}
      
      DATOS DE LA EMPRESA:
      Nombre: ${receiptData.companyName}
      RFC: ${receiptData.companyRfc}
      Dirección: ${receiptData.companyAddress}
      Teléfono: ${receiptData.companyPhone}
      
      DATOS DEL TRANSPORTISTA:
      Nombre: ${receiptData.transporterName}
      Teléfono: ${receiptData.transporterPhone}
      Información: ${receiptData.transporterInfo}
      
      DATOS DEL MATERIAL:
      Título: ${receiptData.materialTitle}
      Tipo: ${receiptData.materialType}
      Cantidad: ${receiptData.materialQuantity} kg
      Escuela: ${receiptData.schoolName}
      
      FECHA DE RECOLECCIÓN:
      ${new Date(receiptData.collectionDate).toLocaleDateString("es-MX")}
      
      TOTAL PAGADO: $${receiptData.totalAmount} MXN
    `;

    const buffer = Buffer.from(pdfContent, "utf-8");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="comprobante-${purchase.folioNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating receipt:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
