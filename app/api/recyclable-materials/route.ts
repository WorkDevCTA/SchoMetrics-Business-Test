import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (
      !session ||
      (session.userType !== "SCHOOL" && session.userType !== "ADMIN")
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();

    const title = formData.get("title") as string;
    const materialType = formData.get("materialType") as string;
    const quantity = Number.parseFloat(formData.get("quantity") as string);
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const postalCode = formData.get("postalCode") as string;
    const address = formData.get("address") as string;
    const latitude = Number.parseFloat(formData.get("latitude") as string);
    const longitude = Number.parseFloat(formData.get("longitude") as string);
    const schedule = formData.get("schedule") as string;
    const userId = formData.get("userId") as string;

    // Get user info for file path
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Upload evidence files
    const evidenceUrls: string[] = [];
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME!;
    const folderPath = `schools/${user.name}/${title}`;

    // for (let i = 0; i < 3; i++) {
    //   const file = formData.get(`evidenceFile${i}`) as File
    //   if (file && file.size > 0) {
    //     const { url } = await uploadFile(file, bucket, folderPath)
    //     evidenceUrls.push(url)
    //   }
    // }

    // Create recyclable material
    const material = await prisma.recyclableMaterial.create({
      data: {
        title,
        materialType: materialType as any,
        quantity,
        city,
        state,
        postalCode,
        address,
        latitude,
        longitude,
        schedule,
        evidenceUrls,
        userId,
      },
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
