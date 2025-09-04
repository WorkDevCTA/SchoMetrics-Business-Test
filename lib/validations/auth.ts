import { z } from "zod"

export const loginSchema = z.object({
  identifier: z.string().min(1, "El identificador es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export const registerSchoolSchema = z
  .object({
    name: z.string().min(1, "El nombre de la escuela es requerido"),
    identifier: z.string().min(1, "El identificador es requerido"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirmar contraseña es requerido"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export const registerCompanySchema = z
  .object({
    name: z.string().min(1, "El nombre de la empresa es requerido"),
    identifier: z.string().min(1, "El identificador es requerido"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirmar contraseña es requerido"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export const registerAdminSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    identifier: z.string().min(1, "El identificador de administrador es requerido"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirmar contraseña es requerido"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterSchoolInput = z.infer<typeof registerSchoolSchema>
export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>
export type RegisterAdminInput = z.infer<typeof registerAdminSchema>
