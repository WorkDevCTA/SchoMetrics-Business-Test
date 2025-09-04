// Importación del Cliente Prisma
import { PrismaClient } from "@prisma/client";

// Declaración de la VARIABLE global para evitar multiples instancias de PrismaClient
declare global {
  var prismaGlobal: undefined | PrismaClient;
}

// Creación de la instancia de prisma
const prisma = globalThis.prismaGlobal ?? new PrismaClient();
/**
Esta línea dice: "Si existe una instancia en globalThis.prismaGlobal, úsala; si no, crea una nueva instancia con new PrismaClient()."
Usa el operador de fusión nula (??), lo que significa que solo creará un nuevo cliente si prismaGlobal es undefined.
 */

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
