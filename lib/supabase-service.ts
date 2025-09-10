import {
  ALLOWED_AVATAR_TYPES,
  ALLOWED_FILE_TYPES,
  bucketName,
  MAX_AVATAR_SIZE,
  MAX_FILE_SIZE,
  supabaseClient,
  supabaseStorageUrl,
} from "@/types/types-supabase-service";
import { v4 as uuidv4 } from "uuid";

export const generateUniqueFileName = (originalName: string): string => {
  const extension = originalName.split(".").pop()?.toLowerCase();
  return `${uuidv4()}.${extension}`;
};

export const sanitizeForStorageKey = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD") // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove accent marks
    .replace(/[^a-z0-9\s-]/g, "") // Keep only alphanumeric, spaces, and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length to 50 characters
};

export const uploadRecyclableMaterialImageToSupabase = async (
  buffer: Buffer,
  originalFileName: string,
  mimeType: string,
  userTypePrefix: string,
  statePrefix: string,
  cityPrefix: string,
  identifierPrefix: string,
  titleResourceEducation: string,
  folderPrefix = "recyclable-material-images/"
): Promise<{
  fileKey: string;
  publicUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  format: string;
}> => {
  const uniqueFileName = generateUniqueFileName(originalFileName);
  const sanitizedTitle = sanitizeForStorageKey(titleResourceEducation);
  // const fileKey = `${userTypePrefix}/${statePrefix}/${cityPrefix}/${nameAccountPrefix}/${folderPrefix}${sanitizedTitle}/${uniqueFileName}`;
  const fileKey = `${userTypePrefix}/${statePrefix}/${cityPrefix}/${identifierPrefix}/${folderPrefix}${sanitizedTitle}/${uniqueFileName}`;
  const format = originalFileName.split(".").pop()?.toLowerCase() || "";

  try {
    const { data, error } = await supabaseClient.storage
      .from(bucketName)
      .upload(fileKey, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error("Error uploading recyclable material to Supabase:", error);
      throw new Error("Error al subir la imagen del material reciclable");
    }

    const publicUrl = `${supabaseStorageUrl}/${fileKey}`;
    console.log(
      "Imagen de Material Reciclable subida a Supabase Storage. Key:",
      fileKey
    );

    return {
      fileKey,
      publicUrl,
      fileName: originalFileName,
      fileType: mimeType,
      fileSize: buffer.byteLength,
      format,
    };
  } catch (error) {
    console.error(
      "Error al subir imagen de material reciclable a Supabase:",
      error
    );
    throw new Error("Error al subir la imagen del material reciclable.");
  }
};

export const uploadAvatarToSupabase = async (
  buffer: Buffer,
  originalFileName: string,
  mimeType: string,
  userTypePrefix: string,
  statePrefix: string,
  cityPrefix: string,
  identifierPrefix: string,
  folderPrefix = "image-profile/"
): Promise<{
  fileKey: string;
  publicUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  format: string;
}> => {
  const uniqueFileName = generateUniqueFileName(originalFileName);
  const fileKey = `${userTypePrefix}/${statePrefix}/${cityPrefix}/${identifierPrefix}/${folderPrefix}${uniqueFileName}`;
  const format = originalFileName.split(".").pop()?.toLowerCase() || "";

  try {
    const { data, error } = await supabaseClient.storage
      .from(bucketName)
      .upload(fileKey, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error("Error uploading avatar to Supabase:", error);
      throw new Error("Error al subir el archivo de avatar");
    }

    const publicUrl = `${supabaseStorageUrl}/${fileKey}`;
    console.log("Avatar subido a Supabase Storage. Key:", fileKey);

    return {
      fileKey,
      publicUrl,
      fileName: originalFileName,
      fileType: mimeType,
      fileSize: buffer.byteLength,
      format,
    };
  } catch (error) {
    console.error(
      "Error al subir buffer(archivo) optimizado a Supabase:",
      error
    );
    throw new Error("Error al subir el archivo de avatar");
  }
};

// Función para obtener la URL firmada de un archivo PRIVADO en Supabase Storage
export const getSignedFileUrl = async (
  bucketName: string,
  filePath: string,
  expiresIn = 3600 // segundos
): Promise<string> => {
  try {
    const { data, error } = await supabaseClient.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error || !data?.signedUrl) {
      console.error("Error al obtener URL firmada:", error?.message);
      throw new Error("No se pudo generar la URL firmada");
    }

    return data.signedUrl;
  } catch (err) {
    console.error("Error inesperado:", err);
    throw new Error("Error al obtener la URL del archivo");
  }
};

export const getPublicSupabaseUrl = (fileKey: string): string | null => {
  if (fileKey) {
    return `${supabaseStorageUrl}/${fileKey}`;
  }
  return null;
};

export const deleteFileFromSupabase = async (
  fileKey: string
): Promise<void> => {
  try {
    const { error } = await supabaseClient.storage
      .from(bucketName)
      .remove([fileKey]);

    if (error) {
      console.error("Error deleting file from Supabase:", error);
      throw new Error("Error al eliminar el archivo");
    }

    console.log("Archivo eliminado de Supabase Storage");
  } catch (error) {
    console.error("Error al eliminar archivo de Supabase:", error);
  }
};

export const deleteUserFolderFromSupabase = async (
  userTypePrefix: string,
  statePrefix: string,
  cityPrefix: string,
  identifierPrefix: string
): Promise<void> => {
  const folderPrefix = `${userTypePrefix}/${statePrefix}/${cityPrefix}/${identifierPrefix}/`;

  try {
    // List all files with the folder prefix
    const { data: files, error: listError } = await supabaseClient.storage
      .from(bucketName)
      .list(folderPrefix, {
        limit: 1000,
        offset: 0,
      });

    if (listError) {
      console.error("Error listing files in user folder:", listError);
      throw new Error("Error al listar archivos del usuario");
    }

    if (!files || files.length === 0) {
      console.log(
        `No se encontraron archivos en la carpeta del usuario '${folderPrefix}'`
      );
      return;
    }

    // Delete all files in the folder
    const filePaths = files.map((file) => `${folderPrefix}${file.name}`);
    const { error: deleteError } = await supabaseClient.storage
      .from(bucketName)
      .remove(filePaths);

    if (deleteError) {
      console.error("Error deleting user folder:", deleteError);
      throw new Error("Error al eliminar los archivos del usuario");
    }

    console.log(
      `Carpeta del usuario '${folderPrefix}' y su contenido fueron eliminados.`
    );
  } catch (error) {
    console.error(
      `Error al eliminar la carpeta del usuario '${folderPrefix}':`,
      error
    );
    throw new Error(
      "Error al eliminar los archivos del usuario en Supabase Storage"
    );
  }
};

export const validateAvatarFile = (
  file: File
): { valid: boolean; error?: string } => {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return {
      valid: false,
      error:
        "Tipo de archivo no permitido para avatar. Solo se permiten JPG, PNG, JPEG, WEBP.",
    };
  }
  if (file.size > MAX_AVATAR_SIZE) {
    return {
      valid: false,
      error: "El archivo de avatar excede el tamaño máximo permitido de 5MB.",
    };
  }
  return { valid: true };
};

export const validateFile = (
  file: File
): { valid: boolean; error?: string } => {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error:
        "Tipo de archivo no permitido. Solo se permiten JPG, PNG, JPEG, WEBP, MP4 y GIF.",
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "El archivo excede el tamaño máximo permitido de 5MB.",
    };
  }
  return { valid: true };
};

export const moveFileInSupabase = async (
  oldFileKey: string,
  newFileKey: string
): Promise<void> => {
  try {
    if (oldFileKey === newFileKey) {
      console.log(`File keys are identical, skipping move: ${oldFileKey}`);
      return;
    }

    // Download the file from the old location
    const { data: fileData, error: downloadError } =
      await supabaseClient.storage.from(bucketName).download(oldFileKey);

    if (downloadError) {
      console.error(
        "Error downloading file for move operation:",
        downloadError
      );
      throw new Error("Error al descargar el archivo para mover");
    }

    const { error: uploadError } = await supabaseClient.storage
      .from(bucketName)
      .upload(newFileKey, fileData, {
        upsert: true, // Changed from false to true to allow overwriting existing files
      });

    if (uploadError) {
      console.error("Error uploading file to new location:", uploadError);
      throw new Error("Error al subir el archivo a la nueva ubicación");
    }

    // Delete the file from the old location
    const { error: deleteError } = await supabaseClient.storage
      .from(bucketName)
      .remove([oldFileKey]);

    if (deleteError) {
      console.error("Error deleting file from old location:", deleteError);
      throw new Error("Error al eliminar el archivo de la ubicación anterior");
    }

    console.log(`Archivo movido de ${oldFileKey} a ${newFileKey}`);
  } catch (error) {
    console.error("Error moving file in Supabase:", error);
    throw new Error("Error al mover el archivo en Supabase Storage");
  }
};
