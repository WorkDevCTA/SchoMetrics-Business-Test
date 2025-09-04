import { MaterialStatus, MaterialType } from "@prisma/client";

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
}
