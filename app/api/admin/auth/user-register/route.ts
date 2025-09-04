import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, identifier, password, userType } = body;

    // Validate data
    if (!name || !identifier || !password) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verify if a user exist
    const existingUser = await prisma.user.findUnique({
      where: { identifier },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El Identificador de Sesión ya está registrado" },
        { status: 400 }
      );
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        identifier,
        password: hashedPassword,
        userType: userType || "SCHOOL",
      },
    });

    // Crear un perfil básico para el usuario
    await prisma.profile.create({
      data: {
        email: `cambiarestecorreo@${user.id.slice(0, 10)}.com`,
        bio: "Añade una descripción personal",
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        message: "Usuario registrado exitosamente",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    );
  }
}
