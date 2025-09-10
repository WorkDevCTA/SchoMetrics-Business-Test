import { MaterialStatus, MaterialType } from "@prisma/client";

export interface UserTotalRecyclableMaterials {
  recyclableMaterialsCount: number;
  recentRecyclableMaterials: RecyclableMaterialItem[];
}

export interface RecyclableMaterialImageItem {
  id: string;
  url: string; // URL pública de S3
  s3Key?: string; // Opcional, solo para referencia interna si es necesario
  order: number;
}

export interface RecyclableMaterialUserData {
  id: string;
  identifier: string;
  name: string;
  role: string;
  userType: string;
  createdAt: string;
  recyclableMaterials: RecyclableMaterialItem[];
}

// NUEVA INTERFAZ: Define la estructura de los datos del usuario publicador
export interface MaterialPublisherInfo {
  name: string;
  userType: string;
  profile: {
    address?: string | null;
    postalCode?: string | null;
    cct?: string | null;
    rfc?: string | null;
  } | null;
}

export interface RecyclableMaterialItem {
  id: string;
  title: string;
  materialType: MaterialType;
  quantity: number;
  city: string;
  state: string;
  postalCode: string;
  address: string;
  latitude: number;
  longitude: number;
  schedule: string;
  images: RecyclableMaterialImageItem[];
  status: MaterialStatus;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: MaterialPublisherInfo; // PROPIEDAD AÑADIDA: Incluye el objeto del usuario
}

export interface AdminUserProfileData {
  id: string;
  identifier: string;
  name: string;
  role: string;
  userType: string;
  createdAt: string;
  profile: {
    id: string; // Añadido por consistencia
    email: string;
    bio?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    address?: string;
    rfc?: string;
    cct?: string;
    publicAvatarDisplayUrl?: string; // Esta será la fileKey de S3
    signedAvatarUrl?: string; // URL firmada para mostrar la imagen
  } | null; // Profile puede ser null si no existe
}

export interface SchoolUserProfileData {
  id: string;
  identifier: string;
  name: string;
  role: string;
  userType: string;
  createdAt: string;
  profile: {
    id: string; // Añadido por consistencia
    email: string;
    bio?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    address?: string;
    rfc?: string;
    cct?: string;
    publicAvatarDisplayUrl?: string; // Esta será la fileKey de S3
    signedAvatarUrl?: string; // URL firmada para mostrar la imagen
  } | null; // Profile puede ser null si no existe
}

// ===== Company Types ====== //
export interface CompanyUserProfileData {
  id: string;
  identifier: string;
  name: string;
  role: string;
  userType: string;
  createdAt: string;
  profile: {
    id: string; // Añadido por consistencia
    email: string;
    bio?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    address?: string;
    rfc?: string;
    cct?: string;
    publicAvatarDisplayUrl?: string; // Esta será la fileKey de S3
    signedAvatarUrl?: string; // URL firmada para mostrar la imagen
  } | null; // Profile puede ser null si no existe
}
