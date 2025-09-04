"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import Image from "next/legacy/image";

export default function AdminRegistroPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    identifier: "",
    password: "",
    confirmPassword: "",
    secretAdminCode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.name || !formData.identifier || !formData.password) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (!adminCode) {
      toast.error("El código de administrador es obligatorio");
      return;
    }

    if (
      formData.secretAdminCode === adminCode &&
      adminCode !== process.env.ADMIN_SECRET_CODE
    ) {
      toast.error("El código de administrador es incorrecto");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/auth/admin-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          identifier: formData.identifier,
          password: formData.password,
          adminCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar administrador");
      } else {
        toast.success("Registro exitoso");
        toast.success("Tu cuenta de administrador ha sido creada");

        // Redirigir al login de administrador
        router.push("/admin/auth/login-admin");
        router.refresh();
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      toast.error("Error al registrar administrador");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="m-28 w-full max-w-lg">
        <CardHeader>
          <div className="mb-5 flex w-full flex-col items-center justify-between gap-2 bg-white md:flex-row">
            <Link
              href="/"
              className="flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Image
                src="/schometrics-logo.png"
                alt="logo"
                width={100}
                height={100}
                priority
                objectFit="contain"
              />
            </Link>
            <Link href="/" className="mt-2 md:mt-0">
              <Button>Volver a Inicio</Button>
            </Link>
          </div>
          <CardTitle className="text-2xl text-slate-500">
            Registro de Administrador
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Crea una cuenta de administrador para gestionar la plataforma
            SchoMetrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                name="name"
                placeholder="Nombre completo"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                required
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="identifier">Identificador de Sesión</Label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="12345678"
                value={formData.identifier}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  </span>
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showConfirmPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"}
                  </span>
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminCode">Código de administrador</Label>
              <Input
                id="adminCode"
                name="adminCode"
                type="password"
                placeholder="Código secreto"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Este código es proporcionado por el desarrollador del sistema
              </p>
            </div>
            <Button
              type="submit"
              className="w-full bg-schoMetricsBaseColor/80 hover:bg-schoMetricsBaseColor"
              disabled={isLoading}
            >
              {isLoading ? "Registrando..." : "Registrarse como administrador"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-xs text-muted-foreground">
            Este portal es exclusivo para administradores del sistema
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
