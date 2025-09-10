import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { userId } = params;

    // Obtener conteo total de materiales reciclables publicados
    const recyclableMaterialsCount = await prisma.recyclableMaterial.count({
      where: { userId: userId as string },
    });

    // Obtener materiales reciclables recientes
    const recentRecyclableMaterials = await prisma.recyclableMaterial.findMany({
      where: { userId: userId as string },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    // Obtener estadísticas por período de tiempo (para gráficos)
    // Agrupar por día para los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return NextResponse.json({
      recyclableMaterialsCount: recyclableMaterialsCount,
      recentRecyclableMaterials: recentRecyclableMaterials,
    });
  } catch (error) {
    console.error(
      "Error al obtener estadísticas de materiales reciclables:",
      error
    );
    return NextResponse.json(
      { error: "Error al obtener estadísticas de materiales reciclables" },
      { status: 500 }
    );
  }
}
