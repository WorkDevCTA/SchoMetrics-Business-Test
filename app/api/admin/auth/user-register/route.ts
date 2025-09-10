import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      identifier,
      password,
      userType,
      email,
      city,
      state,
      postalCode,
      address,
      rfc,
      cct,
    } = body;

    // Validate data
    if (
      !name ||
      !identifier ||
      !password ||
      !userType ||
      !email ||
      !city ||
      !state ||
      !postalCode ||
      !address
    ) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verify if a user exist
    const existingUser = await prisma.user.findUnique({
      where: {
        identifier,
      },
      include: {
        profile: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El Identificador de Sesión ya está registrado" },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe en la base de datos
    const existingUserWithEmail = await prisma.profile.findUnique({
      where: { email: email },
    });

    if (existingUserWithEmail) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado en otro usuario" },
        { status: 400 }
      );
    }
    // Verificar si el CCT ya existe en la base de datos
    const existingUserWithCCT = await prisma.profile.findUnique({
      where: { cct: cct },
    });
    if (existingUserWithCCT) {
      return NextResponse.json(
        { error: "La Clave del Centro de Trabajo ya está registrada" },
        { status: 400 }
      );
    }
    // Verificar si el RFC ya existe en la base de datos
    const existingUserWithRFC = await prisma.profile.findUnique({
      where: { rfc: rfc },
    });
    if (existingUserWithRFC) {
      return NextResponse.json(
        { error: "El RFC ya está registrado en otro usuario" },
        { status: 400 }
      );
    }

    if (userType === "SCHOOL" && !cct) {
      return NextResponse.json(
        {
          error:
            "La Clave del Centro de Trabajo es requerida para usuarios de tipo ESCUELA",
        },
        { status: 400 }
      );
    }

    if (userType === "COMPANY" && !rfc) {
      return NextResponse.json(
        { error: "El RFC es requerido para usuarios de tipo EMPRESA" },
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

    const defaultCCT = nanoid(20);
    const defaultRFC = nanoid(20);

    // Crear un perfil básico para el usuario
    await prisma.profile.create({
      data: {
        email,
        city,
        state,
        postalCode,
        address,
        rfc: rfc || defaultRFC,
        cct: cct || defaultCCT,
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
