"use client"
import { Button } from "@/components/ui/button";
import useUserSession from "@/hooks/useUserSession";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
useRouter
const AdminMaterialesDisponibles = () => {
    const { session } = useUserSession()
    const router = useRouter();
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
        <div className="min-h-screen flex flex-col justify-center items-center text-center gap-5 bg-slate-900 text-white">
            <h1>Bienvenido: Correctamente Iniciado Sesión</h1>
            <div className="flex flex-col justify-center items-center gap-2">
                <p>Nombre: {session?.name}</p>
                <p>Identificador de Sesión: {session?.identifier}</p>
                <p>Rol: {session?.role}</p>
                <p>ID: {session?.id}</p>
            </div>
            <Button variant={"destructive"} onClick={handleLogout}>Cerrar Sesión</Button>
        </div>
    );
}

export default AdminMaterialesDisponibles;