"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, Download, Search, Filter, CheckCircle, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { MATERIAL_TYPE_LABELS, MEXICAN_STATES } from "@/lib/constants"
import { SchoolNavigation } from "@/app/components/school/school-navigation"
import LoaderCircle from "@/app/components/LoaderCircle"
import type { RecyclableMaterialUserData } from "@/types/types"
import { RecyclableMaterialContentImages } from "@/app/components/RecyclableMaterialContentImages"
import toast from "react-hot-toast"
import { MaterialType } from "@prisma/client"
import useUserSession from "@/hooks/useUserSession"

const ITEMS_PER_PAGE = 9;


export default function SchoolPublishedMaterialsPage() {
  const [recyclableMaterials, setRecyclableMaterials] = useState<RecyclableMaterialUserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMaterialType, setSelectedMaterialType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedState, setSelectedState] = useState<string>("all")
  const [recyclableMaterialsFilter, setRecyclableMaterialsFilter] = useState<MaterialType | "ALL">(
    "ALL",
  );

  useEffect(() => {
    fetchMaterials()
  }, [])

  const filteredMaterials = useMemo(() => {
    if (!recyclableMaterials?.recyclableMaterials) return []

    return recyclableMaterials.recyclableMaterials.filter((material) => {
      // Search by name/title
      const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase())

      // Filter by material type
      const matchesMaterialType = selectedMaterialType === "all" || material.materialType === selectedMaterialType

      // Filter by status/availability
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "AVAILABLE" && material.status === "AVAILABLE") ||
        (selectedStatus === "PURCHASED" && material.status === "PURCHASED")

      // Filter by state
      const matchesState = selectedState === "all" || material.state === selectedState

      return matchesSearch && matchesMaterialType && matchesStatus && matchesState
    })
  }, [recyclableMaterials, searchTerm, selectedMaterialType, selectedStatus, selectedState])

  const fetchMaterials = async (page = 1, search = searchTerm, topic = recyclableMaterialsFilter) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      if (search) params.append("search", search);
      if (topic !== "ALL") params.append("topic", topic);
      const response = await fetch(`/api/school/recyclable-materials?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setRecyclableMaterials(data)
      }
    } catch (error) {
      toast.error("Error al cargar materiales")
    } finally {
      setIsLoading(false)
    }
  }

  const openGoogleMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`
    window.open(url, "_blank")
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedMaterialType("all")
    setSelectedStatus("all")
    setSelectedState("all")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SchoolNavigation />
        <LoaderCircle />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SchoolNavigation />

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mis Materiales Publicados</h1>
          <p className="text-muted-foreground">Gestiona tus materiales reciclables publicados</p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Filtros</h2>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search by name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar por nombre</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar materiales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Material type filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Material</label>
              <Select value={selectedMaterialType} onValueChange={setSelectedMaterialType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="PLASTICO">Plástico</SelectItem>
                  <SelectItem value="PAPEL">Papel</SelectItem>
                  <SelectItem value="VIDRIO">Vidrio</SelectItem>
                  <SelectItem value="METAL_COBRE">Metal/Cobre</SelectItem>
                  <SelectItem value="ORGANICO">Orgánico</SelectItem>
                  <SelectItem value="ELECTRONICOS">Electrónicos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status/Availability filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Disponibilidad</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las disponibilidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="AVAILABLE">Disponible</SelectItem>
                  <SelectItem value="PURCHASED">Comprado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* State filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {MEXICAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results counter */}
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredMaterials.length} de {recyclableMaterials?.recyclableMaterials.length || 0} materiales
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                    <CardDescription>{material.quantity} kg</CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className="bg-sky-500 text-white flex text-center items-center w-max">
                      {MATERIAL_TYPE_LABELS[material.materialType]}
                    </Badge>
                    {
                      material.status === "AVAILABLE" && (
                        <Badge className="bg-amber-500 text-white hover:bg-amber-600 w-max">
                          <Clock className="mr-1 h-4 w-4 animate-spin" />
                          Disponible
                        </Badge>
                      )
                    }
                    {
                      material.status === "PURCHASED" && (
                        <Badge className="bg-green-500 text-white hover:bg-green-600 w-max">
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Comprado
                        </Badge>
                      )
                    }
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {material.city}, {material.state}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {material.schedule}
                </div>
                {/* Image List */}
                <div className="">
                  {material.images && material.images.length > 0 && (
                    <div className="flex justify-start items-center gap-2">
                      {material.images && material.images.length > 0 ? (
                        <RecyclableMaterialContentImages visualContent={material.images} />
                      ) : (
                        <p className="text-sm text-gray-500">No hay imágenes adjuntas para este material.</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openGoogleMaps(material.latitude, material.longitude)}
                  >
                    <MapPin className="mr-1 h-3 w-3" />
                    ¿Cómo llegar?
                  </Button>

                  {material.status === "PURCHASED" && (
                    <Button size="sm" variant="outline">
                      <Download className="mr-1 h-3 w-3" />
                      Descargar Comprobante
                    </Button>
                  )}

                  <Link href={`/escuelas/materiales-publicados/editar/${material.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto border-2 border-schoMetricsBaseColor/40 px-2 py-2 text-xs hover:border-schoMetricsBaseColor hover:text-schoMetricsBaseColor"
                    >
                      <Edit className="mr-1 h-3.5 w-3.5" /> Editar/Eliminar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!recyclableMaterials?.recyclableMaterials || recyclableMaterials.recyclableMaterials.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No tienes materiales publicados</p>
            <Button asChild>
              <Link href="/escuelas/publicar-materiales">Publicar mi primer material</Link>
            </Button>
          </div>
        )}

        {filteredMaterials.length === 0 &&
          recyclableMaterials?.recyclableMaterials &&
          recyclableMaterials.recyclableMaterials.length > 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No se encontraron materiales que coincidan con los filtros seleccionados
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          )}
      </div>
    </div>
  )
}

