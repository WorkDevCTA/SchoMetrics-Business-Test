// Material type pricing in MXN per kg
export const MATERIAL_PRICES = {
  PLASTICO: 2.0,
  PAPEL: 1.5,
  VIDRIO: 1.5,
  METAL_COBRE: 10.0,
  ORGANICO: 2.0,
  ELECTRONICOS: 2.5,
} as const;

// Mexican states
export const MEXICAN_STATES = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
] as const;

export type MexicanState = (typeof MEXICAN_STATES)[number];

// Material type labels in Spanish
export const MATERIAL_TYPE_LABELS = {
  PLASTICO: "Plástico",
  PAPEL: "Papel",
  VIDRIO: "Vidrio",
  METAL_COBRE: "Metal Cobre",
  ORGANICO: "Orgánico",
  ELECTRONICOS: "Electrónicos",
} as const;

// User type labels in Spanish
export const USER_TYPE_LABELS = {
  SCHOOL: "Escuela",
  COMPANY: "Empresa",
  ADMIN: "Administrador",
} as const;
