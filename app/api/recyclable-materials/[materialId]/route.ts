import { type NextRequest, NextResponse } from "next/server";
// import { deleteFolder } from "@/lib/file-upload";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { materialId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const material = await prisma.recyclableMaterial.findUnique({
      where: { id: params.materialId },
      include: { user: true },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material no encontrado" },
        { status: 404 }
      );
    }

    // Check if user owns the material or is admin
    if (material.userId !== session.id && session.userType !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Delete files from storage
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME!;
    const folderPath = `schools/${material.user.name}/${material.title}`;

    try {
      // await deleteFolder(bucket, folderPath);
    } catch (error) {
      console.error("Error deleting files:", error);
    }

    // Delete material from database
    await prisma.recyclableMaterial.delete({
      where: { id: params.materialId },
    });

    return NextResponse.json({ message: "Material eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
