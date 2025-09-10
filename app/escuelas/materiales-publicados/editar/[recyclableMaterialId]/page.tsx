"use client";

import React, { useState, useEffect, FormEvent, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    BookOpen,
    Loader2,
    ImagePlus,
    Save,
    X,
    Trash2,
    RotateCcw,
} from "lucide-react";
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
import { z } from "zod";
import toast from "react-hot-toast";
import Image from "next/legacy/image";
import {
    ALLOWED_IMAGE_TYPES,
    MAX_FILES,
    MIN_FILES,
    MAX_FILE_SIZE,
} from "@/types/types-supabase-service";
import { MaterialType, UserType } from "@prisma/client";
import useUserSession from "@/hooks/useUserSession";
import { RecyclableMaterialItem } from "@/types/types";
import LoaderCircle from "@/app/components/LoaderCircle";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SchoolNavigation } from "@/app/components/school/SchoolNavigation";

// Esquema Zod para el formulario de edición de material visual
const recyclableMaterialFormSchemaClient = z.object({
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
});

type RecyclableMaterialUpdateFormClientData = z.infer<
    typeof recyclableMaterialFormSchemaClient
>;
type RecyclableMaterialUpdateFormErrors = Partial<
    Record<keyof RecyclableMaterialUpdateFormClientData, string>
> & { images?: string };

export default function EditReciclableMaterialPage() {
    const router = useRouter();
    const params = useParams();
    const recyclableMaterialId = params.recyclableMaterialId as string;
    const { session, isLoadingSession } = useUserSession();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [formData, setFormDataState] = useState<
        Partial<RecyclableMaterialUpdateFormClientData>
    >({});
    const [errors, setErrors] = useState<RecyclableMaterialUpdateFormErrors>({});

    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<
        { id: string; url: string; s3Key: string; order: number }[]
    >([]);
    const [imagesToDeleteS3Keys, setImagesToDeleteS3Keys] = useState<string[]>(
        [],
    ); // S3 keys de imágenes a eliminar
    const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Para nuevos archivos

    const imageInputRef = useRef<HTMLInputElement>(null);
    const [originalRecyclableMaterialUserId, setOriginalRecyclableMaterialUserId] = useState<
        string | null
    >(null);
    const [isDeleting, setIsDeleting] = useState(false);


    useEffect(() => {
        if (!recyclableMaterialId) {
            toast.error("ID del material reciclable no especificado.");
            router.push("/escuelas/materiales-publicados");
            return;
        }
        async function fetchMaterialData() {
            setIsLoadingData(true);
            try {
                const res = await fetch(
                    `/api/school/recyclable-materials/${recyclableMaterialId}`,
                );
                if (res.status === 404) {
                    toast.error("Material Reciclable no encontrado.");
                    router.push("/escuelas/materiales-publicados");
                    return;
                }
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || "Error al cargar datos del material reciclable.");
                }
                const data: RecyclableMaterialItem = await res.json();

                setFormDataState({
                    title: data.title,
                    materialType: data.materialType,
                    quantity: data.quantity,
                    city: data.city,
                    state: data.state,
                    postalCode: data.postalCode,
                    address: data.address,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    schedule: data.schedule,
                });
                setExistingImages(
                    data.images.map((img) => ({
                        id: img.id,
                        url: img.url,
                        s3Key: img.s3Key || "",
                        order: img.order,
                    })),
                );
                setOriginalRecyclableMaterialUserId(data.userId);
            } catch (error) {
                console.error("Error cargando material para editar:", error);
                toast.error(
                    error instanceof Error ? error.message : "Error al cargar material",
                );
                router.push("/escuelas/materiales-publicados");
            } finally {
                setIsLoadingData(false);
            }
        }
        if (!isLoadingSession) fetchMaterialData();
    }, [recyclableMaterialId, router, isLoadingSession]);

    if (isLoadingSession || isLoadingData) {
        return (
            <div className="flex h-full items-center justify-center">
                <LoaderCircle />
            </div>
        );
    }
    if (
        !session ||
        session.id !== originalRecyclableMaterialUserId ||
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
        if (errors[name as keyof RecyclableMaterialUpdateFormErrors])
            setErrors((prev) => ({ ...prev, [name]: undefined }));
    };
    const handleMaterialTypeChange = (value: string) => {
        setFormDataState((prev) => ({
            ...prev,
            materialType: value as MaterialType,
        }));
        if (errors.materialType) setErrors((prev) => ({ ...prev, materialType: undefined }));
    };

    const handleNewImageFilesChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const filesArray = Array.from(e.target.files || []);
        if (filesArray.length === 0) return;

        const totalCurrentImages =
            existingImages.filter((img) => !imagesToDeleteS3Keys.includes(img.s3Key))
                .length +
            newImageFiles.length +
            filesArray.length;
        if (totalCurrentImages > MAX_FILES) {
            setErrors((prev) => ({
                ...prev,
                images: `No puedes tener más de ${MAX_FILES} imágenes en total.`,
            }));
            if (imageInputRef.current) imageInputRef.current.value = "";
            return;
        }

        const validatedNewFiles = filesArray.filter((file) => {
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`Archivo ${file.name} excede 5MB.`);
                return false;
            }
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                toast.error(`Archivo ${file.name} tiene tipo no permitido.`);
                return false;
            }
            return true;
        });

        setNewImageFiles((prev) => [...prev, ...validatedNewFiles]);
        setImagePreviews((prev) => [
            ...prev,
            ...validatedNewFiles.map((f) => URL.createObjectURL(f)),
        ]);
        setErrors((prev) => ({ ...prev, images: undefined }));
        if (imageInputRef.current) imageInputRef.current.value = "";
    };

    const removeNewImageFile = (index: number) => {
        URL.revokeObjectURL(imagePreviews[index]);
        setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const markExistingImageForDeletion = (s3Key: string) => {
        setImagesToDeleteS3Keys((prev) => [...prev, s3Key]);
        // Validar si al eliminar nos quedamos con menos del mínimo
        const remainingImages =
            existingImages.filter(
                (img) => ![...imagesToDeleteS3Keys, s3Key].includes(img.s3Key),
            ).length + newImageFiles.length;
        if (remainingImages < MIN_FILES) {
            setErrors((prev) => ({
                ...prev,
                images: `Debes tener al menos ${MIN_FILES} imagen.`,
            }));
        } else if (errors.images?.includes("al menos")) {
            setErrors((prev) => ({ ...prev, images: undefined }));
        }
    };

    const unmarkExistingImageForDeletion = (s3Key: string) => {
        setImagesToDeleteS3Keys((prev) => prev.filter((key) => key !== s3Key));
        if (errors.images?.includes("al menos")) {
            // Si había un error por pocas imágenes, revalidar
            const remainingImages =
                existingImages.filter(
                    (img) =>
                        !imagesToDeleteS3Keys
                            .filter((key) => key !== s3Key)
                            .includes(img.s3Key),
                ).length + newImageFiles.length;
            if (remainingImages >= MIN_FILES) {
                setErrors((prev) => ({ ...prev, images: undefined }));
            }
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});

        const currentVisibleExistingImages = existingImages.filter(
            (img) => !imagesToDeleteS3Keys.includes(img.s3Key),
        );
        if (
            currentVisibleExistingImages.length + newImageFiles.length <
            MIN_FILES
        ) {
            setErrors((prev) => ({
                ...prev,
                images: `Debes tener al menos ${MIN_FILES} imagen.`,
            }));
            toast.error(`Se requiere al menos ${MIN_FILES} imagen.`);
            return;
        }
        if (
            currentVisibleExistingImages.length + newImageFiles.length >
            MAX_FILES
        ) {
            setErrors((prev) => ({
                ...prev,
                images: `No puedes exceder ${MAX_FILES} imágenes.`,
            }));
            toast.error(`Máximo ${MAX_FILES} imágenes permitidas.`);
            return;
        }

        setIsSubmitting(true);
        const validationResult =
            recyclableMaterialFormSchemaClient.safeParse(formData);
        if (!validationResult.success) {
            const newErrors: RecyclableMaterialUpdateFormErrors = {};
            validationResult.error.errors.forEach((err) => {
                newErrors[err.path[0] as keyof RecyclableMaterialUpdateFormClientData] =
                    err.message;
            });
            setErrors(newErrors);
            toast.error("Por favor, corrige los errores en el formulario.");
            setIsSubmitting(false);
            return;
        }

        const apiFormData = new FormData();
        Object.entries(validationResult.data).forEach(([key, value]) => {
            if (value !== undefined && value !== null)
                apiFormData.append(key, String(value));
        });
        newImageFiles.forEach((file, index) => {
            apiFormData.append(`images[${index}]`, file);
        });
        apiFormData.append("imagesToDelete", JSON.stringify(imagesToDeleteS3Keys));
        // Enviar IDs, s3Keys y order actual de las imágenes existentes que se conservan
        const keptExistingImagesData = existingImages
            .filter((img) => !imagesToDeleteS3Keys.includes(img.s3Key))
            .map((img) => ({ id: img.id, s3Key: img.s3Key, order: img.order }));
        apiFormData.append(
            "existingImageS3Keys",
            JSON.stringify(keptExistingImagesData),
        );

        try {
            const response = await fetch(
                `/api/school/recyclable-materials/${recyclableMaterialId}`,
                {
                    method: "PUT",
                    body: apiFormData,
                },
            );
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Error al actualizar");
            }
            toast.success("Material Reciclable actualizado!");
            router.push(`/escuelas/materiales-publicados`);
            router.refresh();
        } catch (error) {
            console.error("Error actualizando:", error);
            toast.error(
                error instanceof Error ? error.message : "Error al actualizar.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (
            originalRecyclableMaterialUserId !== session.id ||
            (session.userType !== UserType.SCHOOL &&
                session.userType !== UserType.ADMIN)
        ) {
            toast.error("No tienes permiso para eliminar este material reciclable.");
            return;
        }
        setIsDeleting(true);
        try {
            const response = await fetch(
                `/api/school/recyclable-materials/${recyclableMaterialId}`,
                { method: "DELETE" },
            ); // API a crear
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al eliminar el material reciclable.");
            }
            toast.success("Material reciclable eliminado correctamente.");
            router.push("/escuelas/materiales-publicados");
            router.refresh();
        } catch (err) {
            console.error("Error eliminando material reciclable:", err);
            toast.error(
                err instanceof Error ? err.message : "No se pudo eliminar el material reciclable.",
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const recyclableMaterialArray = Object.values(MaterialType);

    const canEditOrDelete =
        session &&
        originalRecyclableMaterialUserId === session.id &&
        (session.userType === UserType.SCHOOL ||
            session.userType === UserType.ADMIN);

    return (
        <div className="min-h-screen bg-slate-50">
            <SchoolNavigation />
            <Card className="mx-auto max-w-3xl my-10">
                <CardHeader>
                    <div className="mb-2 flex items-center gap-3">
                        <BookOpen className="h-7 w-7 text-lime-600" />
                        <CardTitle className="text-2xl font-semibold">
                            Editar Material Visual
                        </CardTitle>
                    </div>
                    <CardDescription>
                        Modifica los detalles de tu material visual.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        {/* Campos del formulario (Título, Descripción, Tema, etc.) */}
                        <div className="space-y-1">
                            <Label htmlFor="title">
                                Título <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title || ""}
                                onChange={handleInputChange}
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
                                value={formData.materialType || ""}
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
                        <div className="space-y-1">
                            <Label htmlFor="quantity">
                                Cantidad <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="quantity"
                                name="quantity"
                                type="number"
                                value={formData.quantity || ""}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                className={errors.quantity ? "border-red-500" : ""}
                            />
                            {errors.quantity && (
                                <p className="text-sm text-red-500">{errors.quantity}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="city">
                                Ciudad <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="city"
                                name="city"
                                value={formData.city || ""}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                className={errors.city ? "border-red-500" : ""}
                            />
                            {errors.city && (
                                <p className="text-sm text-red-500">{errors.city}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="state">
                                Estado <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="state"
                                name="state"
                                value={formData.state || ""}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                className={errors.state ? "border-red-500" : ""}
                            />
                            {errors.state && (
                                <p className="text-sm text-red-500">{errors.state}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="postalCode">
                                Código Postal <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="postalCode"
                                name="postalCode"
                                value={formData.postalCode || ""}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                className={errors.postalCode ? "border-red-500" : ""}
                            />
                            {errors.postalCode && (
                                <p className="text-sm text-red-500">{errors.postalCode}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="address">
                                Dirección <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address || ""}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                className={errors.address ? "border-red-500" : ""}
                            />
                            {errors.address && (
                                <p className="text-sm text-red-500">{errors.address}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="latitude">
                                Latitud <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="latitude"
                                name="latitude"
                                type="number"
                                value={formData.latitude || ""}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                className={errors.latitude ? "border-red-500" : ""}
                            />
                            {errors.latitude && (
                                <p className="text-sm text-red-500">{errors.latitude}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="longitude">
                                Longitud
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="longitude"
                                name="longitude"
                                type="number"
                                value={formData.longitude || ""}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                className={errors.longitude ? "border-red-500" : ""}
                            />
                            {errors.longitude && (
                                <p className="text-sm text-red-500">{errors.longitude}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="schedule">
                                Horario <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="schedule"
                                name="schedule"
                                value={formData.schedule || ""}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                className={errors.schedule ? "border-red-500" : ""}
                            />
                            {errors.schedule && (
                                <p className="text-sm text-red-500">{errors.schedule}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>
                                Imágenes (Mín. {MIN_FILES}, Máx. {MAX_FILES}){" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            {/* Imágenes Existentes */}
                            {existingImages.length > 0 && (
                                <div className="mb-2">
                                    <p className="mb-1 text-xs text-muted-foreground">
                                        Imágenes actuales:
                                    </p>
                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                        {existingImages.map((img, index) => (
                                            <div
                                                key={img.id}
                                                className={`group relative aspect-square overflow-hidden rounded-md border ${imagesToDeleteS3Keys.includes(img.s3Key) ? "opacity-40 ring-2 ring-red-500 ring-offset-2" : ""}`}
                                            >
                                                <Image
                                                    src={img.url}
                                                    alt={`Imagen existente ${index + 1}`}
                                                    layout="fill"
                                                    objectFit="cover"
                                                />
                                                {imagesToDeleteS3Keys.includes(img.s3Key) ? (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="absolute right-1 top-1 z-10 h-6 w-6 bg-yellow-400 p-0.5 text-black hover:bg-yellow-500"
                                                        onClick={() =>
                                                            unmarkExistingImageForDeletion(img.s3Key)
                                                        }
                                                        disabled={isSubmitting}
                                                        title="Restaurar imagen"
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute right-1 top-1 z-10 h-6 w-6 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                                                        onClick={() =>
                                                            markExistingImageForDeletion(img.s3Key)
                                                        }
                                                        disabled={isSubmitting}
                                                        title="Marcar para eliminar"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Subir Nuevas Imágenes */}
                            <div
                                className={`border-2 p-3 ${errors.images ? "border-red-500" : "border-gray-300"} rounded-lg border-dashed`}
                            >
                                <div
                                    className="flex w-full cursor-pointer items-center justify-center rounded-md bg-gray-50 py-2 transition-colors hover:bg-gray-100"
                                    onClick={() => imageInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        id="newImages"
                                        ref={imageInputRef}
                                        onChange={handleNewImageFilesChange}
                                        className="hidden"
                                        accept={ALLOWED_IMAGE_TYPES.join(",")}
                                        multiple
                                        disabled={
                                            isSubmitting ||
                                            existingImages.filter(
                                                (img) => !imagesToDeleteS3Keys.includes(img.s3Key),
                                            ).length +
                                            newImageFiles.length >=
                                            MAX_FILES
                                        }
                                    />
                                    <ImagePlus className="mr-1.5 h-4 w-4 text-gray-500" />
                                    <span className="text-xs text-gray-600">
                                        Añadir nuevas imágenes (
                                        {existingImages.filter(
                                            (img) => !imagesToDeleteS3Keys.includes(img.s3Key),
                                        ).length + newImageFiles.length}
                                        /{MAX_FILES})
                                    </span>
                                </div>
                                {imagePreviews.length > 0 && (
                                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                                        {imagePreviews.map((previewUrl, index) => (
                                            <div
                                                key={`new-${index}`}
                                                className="group relative aspect-square"
                                            >
                                                <Image
                                                    src={previewUrl}
                                                    alt={`Nueva imagen ${index + 1}`}
                                                    layout="fill"
                                                    objectFit="cover"
                                                    className="rounded"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute right-1 top-1 h-5 w-5 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                                                    onClick={() => removeNewImageFile(index)}
                                                    disabled={isSubmitting}
                                                    title="Eliminar nueva imagen"
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
                            Guardar Cambios
                        </Button>
                        {canEditOrDelete && (
                            <div className="flex gap-2">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={isDeleting}
                                        >
                                            <Trash2 className="mr-1.5 h-4 w-4" /> Eliminar publicación
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer. Esto eliminará
                                                permanentemente la publicación del Material Reciclable.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel disabled={isDeleting}>
                                                Cancelar
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                {isDeleting && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}{" "}
                                                Eliminar publicación
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
