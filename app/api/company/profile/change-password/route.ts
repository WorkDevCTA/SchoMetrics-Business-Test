import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";

// Esquema de validación para el cambio de contraseña
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida."),
  newPassword: z
    .string()
    .min(8, "La nueva contraseña debe tener al menos 8 caracteres."),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { currentPassword, newPassword } = validation.data;
    const userId = session?.id;

    // 1. Obtener usuario de la BD
    const user = await prisma.user.findUnique({
      where: { id: userId as any },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        {
          error: "Usuario no encontrado o no tiene una contraseña configurada.",
        },
        { status: 404 },
      );
    }

    // 2. Verificar si la contraseña actual es correcta
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "La contraseña actual es incorrecta." },
        { status: 400 },
      );
    }

    // 3. Hashear la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 4. Actualizar la contraseña en la BD
    await prisma.user.update({
      where: { id: userId as any },
      data: {
        password: hashedNewPassword,
      },
    });

    return NextResponse.json(
      { message: "Contraseña actualizada exitosamente." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
