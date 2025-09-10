import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPublicSupabaseUrl } from "@/lib/supabase-service";
import { MaterialType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(); // Verificar si el usuario está autenticado
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado para ver material reciclable." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "9", 10); // Ajusta según necesidad
    const materialTypeFilter = searchParams.get(
      "materialType"
    ) as MaterialType | null;
    const searchTerm = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const whereClause: any = { AND: [] };
    // if (topicFilter && topicFilter !== "ALL") {
    if (materialTypeFilter) {
      // Asumiendo "ALL" para no filtrar por tópico
      whereClause.AND.push({ materialType: materialTypeFilter });
    }
    if (searchTerm) {
      whereClause.AND.push({
        OR: [
          { title: { contains: searchTerm } }, // Ajustar mode según DB
        ],
      });
    }
    if (whereClause.AND.length === 0) delete whereClause.AND;

    const recyclableMaterialsFromDb = await prisma.recyclableMaterial.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, userType: true, profile: true },
        },
        images: {
          orderBy: { order: "asc" },
          select: { id: true, s3Key: true, order: true },
        },
      },
    });

    const totalRecyclableMaterials = await prisma.recyclableMaterial.count({
      where: whereClause,
    });

    const recyclableMaterials = await Promise.all(
      recyclableMaterialsFromDb.map(async (vm) => {
        return {
          ...vm,
          images: vm.images.map((img) => ({
            id: img.id,
            url: getPublicSupabaseUrl(img.s3Key),
            order: img.order,
          })),
          _count: undefined, // Limpiar datos no necesarios para el frontend
        };
      })
    );

    return NextResponse.json({
      recyclableMaterials: recyclableMaterials,
      pagination: {
        total: totalRecyclableMaterials,
        page,
        limit,
        totalPages: Math.ceil(totalRecyclableMaterials / limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener materiales reciclables:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor al obtener materiales reciclables.",
      },
      { status: 500 }
    );
  }
}
