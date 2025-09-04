import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    // Validate data
    if (!identifier || !password) {
      return NextResponse.json(
        { error: "El Indentificador de Sesión y Contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Create token JWT
    const token = await encrypt({
      id: user.id,
      identifier: user.identifier,
      userType: user.userType,
      role: user.role,
    });

    // Save token in the cookies
    (
      await // Save token in cookies
      cookies()
    ).set("token", token, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      // maxAge: 60 * 60 * 24, // 1 day => Esta es una cookie definina por lo tanto aun que se cierre el navegador la sesión permanecerá activa hasta que expire
    });

    // Return response without password
    return NextResponse.json({
      id: user.id,
      name: user.name,
      identifier: user.identifier,
      userType: user.userType,
      role: user.role,
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return NextResponse.json(
      { error: "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}
