"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, X, Upload, ArrowLeft, BoxIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MaterialType, UserType } from "@prisma/client"; // Asumiendo que MaterialType se genera en el cliente Prisma
import { z } from "zod";
import toast from "react-hot-toast";
import Image from "next/legacy/image";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILES,
  MIN_FILES,
  MAX_FILE_SIZE,
} from "@/types/types-supabase-service";
import Link from "next/link";
import { MEXICAN_STATES, MexicanState } from "@/lib/constants";
import LoaderCircle from "@/app/components/LoaderCircle";

// Esquema de validación Zod para el frontend
const RecyclableMaterialFormSchemaClient = z.object({
  title: z.string().min(20, "El título debe tener al menos 20 caracteres").max(200, "El título no debe exceder 200 caracteres"),
  materialType: z.nativeEnum(MaterialType),
  quantity: z.coerce
    .number()
    .positive({ message: "La cantidad debe ser mayor a 0" })
    .min(50, "La cantidad debe ser mayor a 50 Kg")
    .max(2000, "La cantidad no debe exceder 2000 Kg"),
  city: z.string().min(1, "Debes ingresar una ciudad"),
  state: z.string().min(1, "Debes ingresar un estado"),
  postalCode: z.string().min(5, "El código postal debe tener al menos 5 caracteres").max(10, "El código postal debe tener 5 caracteres"),
  address: z.string().min(1, "Debes ingresar una dirección"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  schedule: z.string().min(1, "Debes ingresar un horario"),
  images: z
    .array(z.instanceof(File))
    .min(MIN_FILES, `Debes subir al menos ${MIN_FILES} imagen.`)
    .max(MAX_FILES, `Puedes subir un máximo de ${MAX_FILES} imágenes.`)
    .refine(
      (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
      `Cada imagen no debe exceder ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
    )
    .refine(
      (files) => files.every((file) => ALLOWED_IMAGE_TYPES.includes(file.type)),
      "Alguna imagen tiene un tipo de archivo no permitido (JPG, PNG, WEBP).",
    ),
});

type RecyclableMaterialFormClientData = z.infer<
  typeof RecyclableMaterialFormSchemaClient
>;
type RecyclableMaterialFormErrors = Partial<
  Record<keyof RecyclableMaterialFormClientData, string>
>;

function useUserSession() {
  // ... (código del hook useUserSession
  const [session, setSession] = useState<{
    id: string;
    userType: UserType;
    role: string;
    name: string;
    identifier: string;
  } | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          setSession(data.user);
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setSession(null);
      } finally {
        setIsLoadingSession(false);
      }
    }
    fetchSession();
  }, []);
  return { session, isLoadingSession };
}

export default function NewRecyclableMaterialPage() {
  const router = useRouter();
  const { session, isLoadingSession } = useUserSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormDataState] = useState<
    Omit<RecyclableMaterialFormClientData, "images"> & { images: File[] }
  >({
    title: "",
    materialType: "" as MaterialType, // Valor por defecto
    quantity: 0,
    city: "",
    state: "",
    postalCode: "",
    schedule: "",
    address: "",
    latitude: 0,
    longitude: 0,
    images: [],
  });
  const [errors, setErrors] = useState<RecyclableMaterialFormErrors>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const imageInputRef = React.useRef<HTMLInputElement>(null);


  if (isLoadingSession) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoaderCircle />
      </div>
    );
  }
  if (
    !session ||
    (session.userType !== UserType.SCHOOL &&
      session.userType !== UserType.ADMIN)
  ) {
    return (
      <div className="container mx-auto p-4 text-center">
        Acceso Denegado.
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormDataState((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RecyclableMaterialFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
  const handleMaterialTypeChange = (value: string) => {
    setFormDataState((prev) => ({
      ...prev,
      materialType: value as MaterialType,
    }));
    if (errors.materialType) setErrors((prev) => ({ ...prev, materialType: undefined }));
  };

  const handleStateChange = (value: MexicanState | "") => {
    setFormDataState((prev) => ({ ...prev, state: value }));
    if (errors.state) {
      setErrors((prev) => ({ ...prev, state: undefined }));
    }
  };

  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesArray = Array.from(e.target.files || []);
    if (filesArray.length === 0) return;

    const currentTotalFiles = formData.images.length + filesArray.length;
    if (currentTotalFiles > MAX_FILES) {
      setErrors((prev) => ({
        ...prev,
        images: `No puedes subir más de ${MAX_FILES} imágenes.`,
      }));
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    const newImageFiles = [...formData.images, ...filesArray];
    const validationResult =
      RecyclableMaterialFormSchemaClient.shape.images.safeParse(newImageFiles);

    if (!validationResult.success) {
      setErrors((prev) => ({
        ...prev,
        images: validationResult.error.issues[0].message,
      }));
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    setFormDataState((prev) => ({ ...prev, images: newImageFiles }));
    const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setErrors((prev) => ({ ...prev, images: undefined }));
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removeImageFile = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setFormDataState((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    // Re-validar o limpiar errores de cantidad si es necesario
    if (
      formData.images.length - 1 < MAX_FILES &&
      errors.images?.includes("máximo")
    ) {
      setErrors((prev) => ({ ...prev, images: undefined }));
    }
    if (
      formData.images.length - 1 >= MIN_FILES &&
      errors.images?.includes("al menos")
    ) {
      setErrors((prev) => ({ ...prev, images: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const validationResult = RecyclableMaterialFormSchemaClient.safeParse(formData);
    if (!validationResult.success) {
      const newErrors: RecyclableMaterialFormErrors = {};
      validationResult.error.errors.forEach((err) => {
        newErrors[err.path[0] as keyof RecyclableMaterialFormClientData] =
          err.message;
      });
      setErrors(newErrors);
      toast.error("Por favor, corrige los errores en el formulario.");
      setIsSubmitting(false);
      return;
    }

    const apiFormData = new FormData();
    apiFormData.append("title", formData.title);
    apiFormData.append("materialType", formData.materialType);
    apiFormData.append("quantity", formData.quantity.toString());
    apiFormData.append("city", formData.city);
    apiFormData.append("state", formData.state);
    apiFormData.append("postalCode", formData.postalCode);
    apiFormData.append("schedule", formData.schedule);
    apiFormData.append("address", formData.address);
    apiFormData.append("latitude", formData.latitude.toString());
    apiFormData.append("longitude", formData.longitude.toString());
    formData.images.forEach((file, index) => {
      apiFormData.append(`images[${index}]`, file);
    });

    try {
      const response = await fetch("/api/school/recyclable-materials", {
        method: "POST",
        body: apiFormData, // FormData se envía directamente
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el material reciclable");
      }
      toast.success("Material reciclable creado exitosamente!");
      router.push(`/escuelas/materiales-publicados`); // Redirigir a la pestaña de materiales publicados
      router.refresh();
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error desconocido al crear material reciclable.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const recyclableMaterialArray = Object.values(MaterialType);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 mt-16 lg:mt-0">
        <Link
          href={`/escuelas/materiales-publicados`}
          className="flex items-center text-sm text-lime-600 hover:underline"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Volver a Materiales Publicados
        </Link>
      </div>
      <Card className="0 mx-auto max-w-3xl">
        <CardHeader>
          <div className="mb-2 flex items-center gap-3">
            <BoxIcon className="h-7 w-7 text-lime-600" />
            <CardTitle className="text-2xl font-semibold">
              Crear Nuevo Material Reciclable
            </CardTitle>
          </div>
          <CardDescription>
            Completa la información para publicar tu material reciclable.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Título */}
            <div className="space-y-1">
              <Label htmlFor="title">
                Título de la Publicación{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ej: Disponibilidad de 100 kg de material PET"
                disabled={isSubmitting}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>
            {/* Tipo de Material */}
            <div className="space-y-1">
              <Label htmlFor="materialType">
                Tipos de Materiales <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.materialType}
                onValueChange={handleMaterialTypeChange}
                name="materialType"
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="materialType"
                  name="materialType"
                  className={errors.materialType ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Selecciona un Tipo de Material válido" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Temas de Material Reciclable</SelectLabel>
                    {recyclableMaterialArray.map((materialTypeValue) => (
                      <SelectItem key={materialTypeValue} value={materialTypeValue}>
                        {materialTypeValue
                          .replace(/_/g, " ")
                          .charAt(0)
                          .toUpperCase() +
                          materialTypeValue
                            .replace(/_/g, " ")
                            .slice(1)
                            .toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.materialType && (
                <p className="text-sm text-red-500">{errors.materialType}</p>
              )}
            </div>

            {/* Cantidad */}
            <div className="space-y-1">
              <Label htmlFor="quantity">
                Cantidad (Kg) <span className="text-red-500">*</span>
              </Label>
              {/* Verificar que solo se puedan ingresar números enteros/decimales */}
              <Input
                id="quantity"
                name="quantity"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                step="0.1"
                min="50"
                max="2000"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="Ej: 150"
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete"
                  ) {
                    e.preventDefault();
                  }
                }}
                className={errors.quantity ? "border-red-500" : ""}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Ciudad */}
              <div className="space-y-2">
                <Label htmlFor="city">
                  Ciudad <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Ej: Cuernavaca"
                  disabled={isSubmitting}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>
              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="state">
                  Estado <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) =>
                    handleStateChange(value as MexicanState | "")
                  }
                  disabled={isSubmitting}
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
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Código Postal */}
              <div className="space-y-1">
                <Label htmlFor="postalCode">
                  Código Postal{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="Ej: 62000"
                  disabled={isSubmitting}
                  className={errors.postalCode ? "border-red-500" : ""}
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-500">{errors.postalCode}</p>
                )}
              </div>
            </div>
            {/* Dirección Completa */}
            <div className="space-y-1">
              <Label htmlFor="address">
                Direcion completa de tu Escuela{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Ej: Calle, Número, Colonia"
                disabled={isSubmitting}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            {/* Ubicación Geográfica */}
            <h3 className="text-md mt-4 border-t pt-2 font-semibold">
              Ubicación Geográfica
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="latitude">
                  Latitud <span className="text-red-500">*</span>
                  <span className="text-slate-500">{" "} Ejemplo: 18.921785896388464</span>
                </Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  placeholder="Ej: 18.921129"
                  disabled={isSubmitting}
                />
                {errors.latitude && (
                  <p className="text-sm text-red-500">{errors.latitude}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">
                  Longitud <span className="text-red-500">*</span>
                  <span className="text-slate-500">{" "} Ejemplo: -99.23428623187398</span>
                </Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  placeholder="Ej: -99.234047"
                  disabled={isSubmitting}
                />
                {errors.longitude && (
                  <p className="text-sm text-red-500">{errors.longitude}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Puedes obtener la latitud y longitud desde Google Maps (clic
              derecho sobre el mapa &gt; ¿Qué hay aquí?).
            </p>

            {/* Horarios */}
            <div className="space-y-1">
              <Label htmlFor="schedule">
                Horarios de Antención. Disponibilidad para que la Empresa recolecte los materiales reciclables{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="schedule"
                name="schedule"
                value={formData.schedule}
                onChange={handleInputChange}
                placeholder="Ej: Lunes a Viernes de 9 AM - 5 PM, Sábados 9 AM - 1 PM"
                disabled={isSubmitting}
                className={errors.schedule ? "border-red-500" : ""}
              />
              {errors.schedule && (
                <p className="text-sm text-red-500">{errors.schedule}</p>
              )}
            </div>

            {/* Imágenes */}
            <div className="space-y-1">
              <Label htmlFor="images">
                Imágenes (Mín. {MIN_FILES}, Máx. {MAX_FILES}){" "}
                <span className="text-red-500">*</span>
              </Label>
              <div
                className={`border - 2 p - 4 ${errors.images ? "border-red-500" : "border-gray-300"} rounded - lg border - dashed`}
              >
                <div
                  className="flex w-full cursor-pointer items-center justify-center rounded-md bg-gray-50 py-3 transition-colors hover:bg-gray-100"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <input
                    type="file"
                    id="images"
                    name="images"
                    ref={imageInputRef}
                    onChange={handleImageFilesChange}
                    className="hidden"
                    accept={ALLOWED_IMAGE_TYPES.join(",")}
                    multiple
                    disabled={
                      isSubmitting || formData.images.length >= MAX_FILES
                    }
                  />
                  <Upload className="mr-2 h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {formData.images.length >= MAX_FILES
                      ? `Máximo ${MAX_FILES} imágenes`
                      : `Añadir imágenes(${formData.images.length} / ${MAX_FILES})`}
                  </span>
                </div>
                {imagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {imagePreviews.map((previewUrl, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square"
                      >
                        <Image
                          src={previewUrl}
                          alt={`Vista previa ${index + 1}`}
                          layout="fill"
                          objectFit="cover"
                          className="rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute right-1 top-1 h-5 w-5 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => removeImageFile(index)}
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.images && (
                <p className="mt-1 text-sm text-red-500">{errors.images}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col justify-center gap-3 sm:flex-row sm:items-start sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-lime-600 hover:bg-lime-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Publicar Material
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div >
  );
}
