"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Leaf, User, Users, ShoppingCart, UserPlus, LogOut, Shield, Box, BadgeDollarSign } from "lucide-react"
import useUserSession from "@/hooks/useUserSession"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { getInitials } from "@/hooks/getInitials"
import Image from "next/image"
import { useEffect, useState } from "react"
import { AdminUserProfileData } from "@/types/types"


export function AdminNavigation() {
  const { session } = useUserSession()
  const router = useRouter()
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<AdminUserProfileData | null>(null); // Initialize as null
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProfileData()]);
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true) //will be handled by the main isLoading state
    try {
      const response = await fetch("/api/school/profile");
      if (!response.ok) throw new Error("Error al obtener perfil");
      const data: AdminUserProfileData = await response.json();
      setProfile(data);
      setAvatarPreviewUrl(null);
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      toast.error("Error, No se pudo cargar el perfil");
    }
    setIsLoading(false) //will be handled by the main isLoading state
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        toast.success("Has cerrado sesión correctamente");
        router.push("/");
      } else {
        toast.error("Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("No se pudo cerrar sesión");
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-end gap-2">
            <div className="flex items-center gap-2">
              <Image src="/schometrics-logo.png" alt="schometrics-logo" width={100} height={90} />
            </div>
            <Shield className="h-5 w-5 text-destructive ml-2" />
            <span className="text-sm font-medium text-destructive">Admin</span>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-12 rounded-full md:h-14 md:w-14">
                  <Avatar
                    className="pointer-events-none h-12 w-12 select-none md:h-14 md:w-14"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  >
                    <AvatarImage
                      src={
                        avatarPreviewUrl ||
                        profile?.profile?.publicAvatarDisplayUrl ||
                        ""
                      }
                      alt={profile?.name || "Avatar"}
                    />
                    <AvatarFallback className="bg-lime-500 text-md uppercase text-white">
                      {getInitials(profile?.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{session?.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{session?.identifier}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/admin/perfil`}>
                    <User className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/auth/registro-admin">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registrar Admin
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/auth/registro-usuario">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registrar Escuela
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/auth/registro-usuario">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registrar Empresa
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/materiales-disponibles">
                    <Box className="mr-2 h-4 w-4" />
                    Materiales Disponibles
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/perfil">
                    <BadgeDollarSign className="mr-2 h-4 w-4 text-green-600" />
                    <p className="text-green-600 font-semibold">
                      Apartados Recibidos
                    </p>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/perfil">
                    <Users className="mr-2 h-4 w-4" />
                    Usuarios
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4 text-red-600" />
                  <p className="text-red-600 font-semibold">
                    Cerrar Sesión
                  </p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
