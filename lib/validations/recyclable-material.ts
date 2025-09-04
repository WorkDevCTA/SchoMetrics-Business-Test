import { z } from "zod"
import { MaterialType } from "@prisma/client"

export const recyclableMaterialSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  materialType: z.nativeEnum(MaterialType, {
    errorMap: () => ({ message: "Selecciona un tipo de material válido" }),
  }),
  quantity: z.number().min(50, "La cantidad mínima es 50 kg"),
  city: z.string().min(1, "La ciudad es requerida"),
  state: z.string().min(1, "El estado es requerido"),
  postalCode: z.string().min(5, "El código postal debe tener al menos 5 dígitos"),
  address: z.string().min(1, "La dirección es requerida"),
  latitude: z.number().min(-90).max(90, "Latitud inválida"),
  longitude: z.number().min(-180).max(180, "Longitud inválida"),
  schedule: z.string().min(1, "El horario de atención es requerido"),
  evidenceFiles: z
    .array(z.instanceof(File))
    .min(1, "Debes subir al menos 1 imagen")
    .max(3, "Máximo 3 imágenes permitidas")
    .refine((files) => files.every((file) => file.size <= 5 * 1024 * 1024), "Cada imagen debe ser menor a 5MB")
    .refine(
      (files) => files.every((file) => ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)),
      "Solo se permiten archivos JPG, JPEG, PNG o WEBP",
    ),
})

export type RecyclableMaterialInput = z.infer<typeof recyclableMaterialSchema>
