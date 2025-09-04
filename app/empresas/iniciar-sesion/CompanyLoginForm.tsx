"use client";

import type React from "react"; // Asegúrate de importar React si usas tipos de React
import { useState } from "react"; // Suspense no es necesario aquí, sino en el que lo llama
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, BadgeInfo } from "lucide-react";
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
import Image from "next/image";

export default function CompanyLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Este hook es el que requiere Suspense en el componente padre
  const callbackUrl = searchParams.get("callbackUrl") || "/empresas/materiales-disponibles";

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.identifier || !formData.password) {
      toast.error("Identificador de Sesión y contraseña son obligatorios");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/company/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Los datos ingresados son incorrectos"); // Usar el mensaje de error de la API si está disponible
        // No redirigir aquí si la URL de callback es la misma página de login,
        // podría causar un bucle si el error persiste.
        // router.push(callbackUrlLoginFailed);
      } else {
        toast.success("Bienvenido");
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      toast.error("Error al iniciar sesión. Intenta de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border border-emerald-100 shadow-lg shadow-emerald-100">
      <CardHeader className="space-y-1">
        <div className="mb-5 flex w-full items-center justify-between bg-white">
          <Link
            href="/"
            className="flex items-end justify-center gap-2 text-center text-2xl"
          >
            <Image
              src="/schometrics-logo.png"
              alt="logo"
              width={120}
              height={120}
              priority
            />
            <span className="text-md font-bold text-schoMetricsBaseColor">
              SchoMetrics
            </span>
          </Link>
        </div>
        <CardTitle className="text-2xl text-slate-500">
          Iniciar sesión
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Ingresa tus credenciales para acceder a la plataforma
        </CardDescription>
        <span className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
          <BadgeInfo className="h-5 w-5 text-muted-foreground" />
          El Identificador de Sesión es sensible a mayúsculas y minúsculas.
          <br />
          Si tu Identificador de Sesión es: "AA001", entonces "aa001" no funcionará.
        </span>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="identifier">Identificador de Sesión"</Label>
            <Input
              id="identifier"
              name="identifier"
              type="text"
              placeholder="12345678"
              value={formData.identifier}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                disabled={isLoading}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <Link
              href="/login/recuperar-password"
              className="text-sm text-emerald-600 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando
                sesión...
              </>
            ) : (
              "Iniciar sesió Cuenta Empresa"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
