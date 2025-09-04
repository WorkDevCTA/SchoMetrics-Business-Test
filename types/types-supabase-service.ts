import { createClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// Supabase Storage bucket name
export const bucketName = "schometrics-business-test-1";

// Base URL for Supabase Storage
export const supabaseStorageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}`;

// Tipos de archivos permitidos (solo imágenes para avatar)
export const ALLOWED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

// Tipos generales para todas las imágenes del proyecto
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

// export const ALLOWED_VIDEO_TYPES = ["video/mp4", "image/gif"]; // GIF se trata como video para este caso

export const ALLOWED_FILE_TYPES = [
  // Usado para validación general
  ...ALLOWED_IMAGE_TYPES,
  // ...ALLOWED_VIDEO_TYPES,
];

export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB para avatares
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB general para imágenes
// export const MAX_SHORT_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB para videos cortos
export const MAX_THUMBNAIL_SIZE = 2 * 1024 * 1024; // 2MB para miniaturas

// Constantes para la carga de archivos
export const MIN_FILES = 1; // Mínimo de archivos
export const MAX_FILES = 3; // Máximo de archivos
