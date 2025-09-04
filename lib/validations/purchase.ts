import { z } from "zod"

export const purchaseSchema = z.object({
  companyName: z.string().min(1, "El nombre de la empresa es requerido"),
  companyRfc: z.string().min(12, "El RFC debe tener al menos 12 caracteres"),
  companyAddress: z.string().min(1, "La dirección de la empresa es requerida"),
  companyPhone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  transporterName: z.string().min(1, "El nombre del transportista es requerido"),
  transporterPhone: z.string().min(10, "El teléfono del transportista debe tener al menos 10 dígitos"),
  transporterInfo: z.string().min(1, "La información del transportista es requerida"),
  collectionDate: z.string().min(1, "La fecha de recolección es requerida"),
  customerName: z.string().min(1, "El nombre del cliente es requerido"),
  customerEmail: z.string().email("Email inválido"),
})

export type PurchaseInput = z.infer<typeof purchaseSchema>
