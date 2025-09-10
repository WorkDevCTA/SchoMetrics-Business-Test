"use client";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MexicanState, MEXICAN_STATES } from "@/lib/constants";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
const ManualFormCreateUser = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    identifier: "",
    password: "",
    confirmPassword: "",
    email: "",
    city: "",
    state: "",
    postalCode: "",
    address: "",
    rfc: "",
    cct: "",
    userType: "SCHOOL",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [identifierError, setidentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [cityError, setCityError] = useState<string | null>(null);
  const [stateError, setStateError] = useState<string | null>(null);
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [rfcError, setRfcError] = useState<string | null>(null);
  const [cctError, setCctError] = useState<string | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar errores al cambiar el valor
    if (name === "name") setNameError(null);
    if (name === "identifier") setidentifierError(null);
    if (name === "password") setPasswordError(null);
    if (name === "confirmPassword") setConfirmPasswordError(null);
    if (name === "email") setEmailError(null);
    if (name === "city") setCityError(null);
    if (name === "state") setStateError(null);
    if (name === "postalCode") setPostalCodeError(null);
    if (name === "address") setAddressError(null);
    if (name === "rfc") setRfcError(null);
    if (name === "cct") setCctError(null);
  };


  const handleStateChange = (value: MexicanState | "") => {
    setFormData((prev) => ({ ...prev, state: value }));
  };

  const handleUserTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, userType: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    let isValid = true;

    // Validar Nombre
    if (formData.name.length < 10 || formData.name.length > 50) {
      setNameError("El nombre debe tener entre 10 y 50 caracteres");
      isValid = false;
    }

    // Validar Contraseña
    if (formData.password.length < 6 || formData.password.length > 100) {
      setPasswordError("La contraseña debe tener entre 6 y 100 caracteres");
      isValid = false;
    }

    // Validar Confirmar Contraseña
    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/admin/auth/user-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          identifier: formData.identifier,
          password: formData.password,
          email: formData.email,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          address: formData.address,
          rfc: formData.rfc,
          cct: formData.cct,
          userType: formData.userType,
        }),
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        toast.error("Error al registrarse");
      } else {
        toast.success("Registro exitoso");
        toast.success("La cuenta ha sido creada correctamente");

        router.refresh();

        formData.name = "";
        formData.identifier = "";
        formData.password = "";
        formData.confirmPassword = "";
        formData.email = "";
        formData.city = "";
        formData.state = "";
        formData.postalCode = "";
        formData.address = "";
        formData.rfc = "";
        formData.cct = "";
        formData.userType = "SCHOOL";

        setFormData(formData);
      }
    } catch (error) {
      console.error("Error al registrarse:", error);
      toast.error("Error al registrarse");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Card className="w-auto">
      <CardHeader className="space-y-1">
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
            />
          </Link>
          <Link href="/" className="mt-2 md:mt-0">
            <Button>Volver a Inicio</Button>
          </Link>
        </div>
        <CardTitle className="text-2xl text-slate-500">
          Crear una cuenta para Escuelas o Empresas
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Ingresa los datos para registrar una nueva cuenta en la plataforma
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              placeholder="Nombre completo del usuario"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              className="uppercase"
            />
            {nameError && <p className="text-sm text-red-500">{nameError}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="identifier">Identificador de Sesión</Label>
            <Input
              id="identifier"
              name="identifier"
              type="text"
              placeholder="12345678"
              value={formData.identifier}
              onChange={handleChange}
              disabled={isLoading}
            />
            {identifierError && (
              <p className="text-sm text-red-500">{identifierError}</p>
            )}
          </div>
          <div className="relative grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña segura"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
            </div>
          </div>
          <div className="relative grid gap-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirma la contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
              {confirmPasswordError && (
                <p className="text-sm text-red-500">{confirmPasswordError}</p>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            {emailError && <p className="text-sm text-red-500">{emailError}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              name="city"
              type="text"
              placeholder="Ciudad"
              value={formData.city}
              onChange={handleChange}
              disabled={isLoading}
            />
            {cityError && <p className="text-sm text-red-500">{cityError}</p>}
          </div>
          <div className="space-y-2 w-max">
            <Label htmlFor="state">
              Estado <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.state}
              onValueChange={(value) =>
                handleStateChange(value as MexicanState | "")
              }
              disabled={isLoading}
            >
              <SelectTrigger id="state">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Estados de México</SelectLabel>
                  {MEXICAN_STATES.map((stateName) => (
                    <SelectItem key={stateName} value={stateName}>
                      {stateName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {stateError && <p className="text-sm text-red-500">{stateError}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="postalCode">Código Postal</Label>
            <Input
              id="postalCode"
              name="postalCode"
              type="text"
              placeholder="Código Postal"
              value={formData.postalCode}
              onChange={handleChange}
              disabled={isLoading}
            />
            {postalCodeError && (
              <p className="text-sm text-red-500">{postalCodeError}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              name="address"
              type="text"
              placeholder="Dirección"
              value={formData.address}
              onChange={handleChange}
              disabled={isLoading}
            />
            {addressError && <p className="text-sm text-red-500">{addressError}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rfc">RFC</Label>
            <Input
              id="rfc"
              name="rfc"
              type="text"
              placeholder="RFC"
              value={formData.rfc}
              onChange={handleChange}
              disabled={isLoading}
            />
            {rfcError && <p className="text-sm text-red-500">{rfcError}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cct">CCT</Label>
            <Input
              id="cct"
              name="cct"
              type="text"
              placeholder="CCT"
              value={formData.cct}
              onChange={handleChange}
              disabled={isLoading}
            />
            {cctError && <p className="text-sm text-red-500">{cctError}</p>}
          </div>
          <div className="grid gap-2">
            <Label>Tipo de usuario</Label>
            <RadioGroup
              value={formData.userType}
              onValueChange={handleUserTypeChange}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SCHOOL" id="school" />
                <Label htmlFor="school">Escuela</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="COMPANY" id="company" />
                <Label htmlFor="company">Empresa</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full bg-schoMetricsBaseColor/80 hover:bg-schoMetricsBaseColor"
            disabled={isLoading}
          >
            {isLoading ? "Registrando..." : "Registrar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ManualFormCreateUser;
