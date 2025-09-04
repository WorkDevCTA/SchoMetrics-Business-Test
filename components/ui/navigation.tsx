"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, Leaf, School } from "lucide-react"
import Image from "next/image"
export function Navigation() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-4 my-2 flex flex-col h-44 items-center justify-between md:flex-row md:items-center md:justify-between md:h-16">
          <div className="flex items-end gap-2">
            <Image src="/schometrics-logo.png" alt="schometrics-logo" width={100} height={100} priority />
          </div>

          <div className="py-4 flex flex-col items-center gap-4 md:flex-row md:items-center">
            <Button asChild variant="outline" className="bg-white text-lime-600 transition-all ease-linear duration-500 hover:text-lime-700 border border-lime-500 hover:bg-white hover:-translate-x-1">
              <Link href="/escuelas/iniciar-sesion">
                <School className="mr-2 h-5 w-5 animate-heartbeat" />
                Iniciar Sesión Escuelas
              </Link>
            </Button>
            <Button asChild className="bg-emerald-700 text-white transition-all ease-linear duration-500 hover:translate-x-1 hover:bg-emerald-600">
              <Link href="/empresas/iniciar-sesion">
                <Building2 className="mr-2 h-5 w-5 animate-heartbeat" />
                Iniciar Sesión Empresas
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
