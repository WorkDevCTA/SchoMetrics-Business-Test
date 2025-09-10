import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import {
  getPublicSupabaseUrl,
  uploadRecyclableMaterialImageToSupabase,
  validateFile,
} from "@/lib/supabase-service";
import { UserType, MaterialType, MaterialStatus } from "@prisma/client";
import { MAX_FILES, MIN_FILES } from "@/types/types-supabase-service"; // Usar constantes de s3-service
import { optimizeImage } from "@/lib/image-compress-utils";

// Esquema Zod para la creación de material Recyclable (backend)
const createRecyclableMaterialSchema = z.object({
  title: z.string().min(20).max(200),
  materialType: z.nativeEnum(MaterialType),
  quantity: z.coerce
    .number()
    .positive({ message: "La cantidad debe ser mayor a 50 kg" })
    .min(50)
    .max(2000),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(5).max(5),
  address: z.string().min(1),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  schedule: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (
      !session ||
      !session.id ||
      (session.userType !== UserType.SCHOOL &&
        session.userType !== UserType.ADMIN)
    ) {
      return NextResponse.json(
        { error: "No autorizado para publicar material reciclable." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const formValues: Record<string, any> = {};
    const imageFiles: File[] = [];

    formData.forEach((value, key) => {
      if (key.startsWith("images[")) {
        // Asumiendo que los archivos se envían como images[0], images[1], etc.
        if (value instanceof File) {
          imageFiles.push(value);
        }
      } else {
        formValues[key] = value;
      }
    });

    // Limpiar strings vacíos opcionales a null antes de validar
    if (formValues.description === "") formValues.description = null;
    if (formValues.authorInfo === "") formValues.authorInfo = null;

    const validationResult =
      createRecyclableMaterialSchema.safeParse(formValues);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      title,
      materialType,
      quantity,
      city,
      state,
      postalCode,
      address,
      latitude,
      longitude,
      schedule,
    } = validationResult.data;

    if (imageFiles.length < MIN_FILES || imageFiles.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Se deben subir entre ${MIN_FILES} y ${MAX_FILES} imágenes.` },
        { status: 400 }
      );
    }

    for (const file of imageFiles) {
      const fileValidation = validateFile(file); // Usar la validación general de archivos
      if (!fileValidation.valid) {
        return NextResponse.json(
          { error: fileValidation.error || `Archivo inválido: ${file.name}` },
          { status: 400 }
        );
      }
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.id as string },
      include: { profile: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const uploadedImageS3Keys: { s3Key: string; order: number }[] = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const optimizedBuffer = await optimizeImage(file);
      const s3Response = await uploadRecyclableMaterialImageToSupabase(
        optimizedBuffer,
        file.name,
        "image/jpeg",
        currentUser.userType,
        currentUser.profile?.state || "",
        currentUser.profile?.city || "",
        currentUser.identifier,
        title
      ); // Usa la nueva función específica
      uploadedImageS3Keys.push({ s3Key: s3Response.fileKey, order: i });
    }

    const recyclableMaterial = await prisma.recyclableMaterial.create({
      data: {
        title,
        materialType,
        quantity,
        city,
        state,
        postalCode,
        address,
        latitude,
        longitude,
        schedule,
        status: MaterialStatus.AVAILABLE,
        userId: session.id as string,
        images: {
          create: uploadedImageS3Keys.map((img) => ({
            s3Key: img.s3Key,
            order: img.order,
          })),
        },
      },
      include: { images: true }, // Incluir imágenes en la respuesta
    });

    // Si es necesario y requerido: Añadir aquí un SnapShot de todos los Materiales Reciclables publicados.

    // Formatear URLs para la respuesta
    const responseRecyclableMaterial = {
      ...recyclableMaterial,
      images: recyclableMaterial.images.map((img) => ({
        id: img.id,
        url: getPublicSupabaseUrl(img.s3Key), // Convertir s3Key a URL pública
        order: img.order,
      })),
    };

    return NextResponse.json(responseRecyclableMaterial, { status: 201 });
  } catch (error) {
    console.error("Error al publicar material reciclable:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error interno del servidor al publicar material reciclable." },
      { status: 500 }
    );
  }
}

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

    const whereClause: any = {
      userId: session.id, // <-- CRITICAL FIX: Filter by the current user's ID
      AND: [],
    };
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
        user: { select: { id: true, name: true, userType: true } },
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
