"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { MATERIAL_TYPE_LABELS, MEXICAN_STATES, MATERIAL_PRICES } from "@/lib/constants"
import { purchaseSchema, type PurchaseInput } from "@/lib/validations/purchase"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { MaterialType } from "@prisma/client"
import { Search, MapPin, Clock, ShoppingCart, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { CompanyNavigation } from "@/app/components/company/company-navigation"
import useUserSession from "@/hooks/useUserSession"

interface RecyclableMaterial {
    id: string
    title: string
    materialType: MaterialType
    quantity: number
    city: string
    state: string
    address: string
    latitude: number
    longitude: number
    schedule: string
    evidenceUrls: string[]
    user: {
        name: string
    }
}

export default function AvailableMaterialsPage() {
    const [materials, setMaterials] = useState<RecyclableMaterial[]>([])
    const [filteredMaterials, setFilteredMaterials] = useState<RecyclableMaterial[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [materialTypeFilter, setMaterialTypeFilter] = useState<string>("all")
    const [stateFilter, setStateFilter] = useState<string>("all")
    const [isLoading, setIsLoading] = useState(true)
    const [selectedMaterial, setSelectedMaterial] = useState<RecyclableMaterial | null>(null)
    const [isPurchasing, setIsPurchasing] = useState(false)
    const { session } = useUserSession()

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<PurchaseInput>({
        resolver: zodResolver(purchaseSchema),
    })

    useEffect(() => {
        fetchMaterials()
    }, [])

    useEffect(() => {
        filterMaterials()
    }, [materials, searchTerm, materialTypeFilter, stateFilter])

    const fetchMaterials = async () => {
        try {
            const response = await fetch("/api/company/recyclable-materials/available")
            if (response.ok) {
                const data = await response.json()
                setMaterials(data)
            }
        } catch (error) {
            toast.error("Error al cargar materiales")
        } finally {
            setIsLoading(false)
        }
    }

    const filterMaterials = () => {
        let filtered = materials

        if (searchTerm) {
            filtered = filtered.filter((material) => material.title.toLowerCase().includes(searchTerm.toLowerCase()))
        }

        if (materialTypeFilter !== "all") {
            filtered = filtered.filter((material) => material.materialType === materialTypeFilter)
        }

        if (stateFilter !== "all") {
            filtered = filtered.filter((material) => material.state === stateFilter)
        }

        setFilteredMaterials(filtered)
    }

    const calculateTotal = (materialType: MaterialType, quantity: number) => {
        return (MATERIAL_PRICES[materialType] * quantity).toFixed(2)
    }

    const openGoogleMaps = (latitude: number, longitude: number) => {
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`
        window.open(url, "_blank")
    }

    const onPurchaseSubmit = async (data: PurchaseInput) => {
        if (!selectedMaterial || !session?.id) return

        setIsPurchasing(true)
        try {
            const totalAmount = Number.parseFloat(calculateTotal(selectedMaterial.materialType, selectedMaterial.quantity))

            const purchaseData = {
                ...data,
                recyclableMaterialId: selectedMaterial.id,
                totalAmount,
                userId: session.id,
            }

            const response = await fetch("/api/purchases", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(purchaseData),
            })

            if (response.ok) {
                const result = await response.json()

                // Redirect to Openpay payment
                if (result.paymentUrl) {
                    window.location.href = result.paymentUrl
                } else {
                    toast.success("Compra realizada exitosamente")
                    setSelectedMaterial(null)
                    reset()
                    fetchMaterials()
                }
            } else {
                toast.error("Error al procesar la compra")
            }
        } catch (error) {
            toast.error("Error al procesar la compra")
        } finally {
            setIsPurchasing(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <CompanyNavigation />
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="text-center">Cargando materiales disponibles...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <CompanyNavigation />

            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Materiales Disponibles</h1>
                    <p className="text-muted-foreground">Encuentra y compra materiales reciclables de escuelas</p>
                </div>

                {/* Filters */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por título..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select value={materialTypeFilter} onValueChange={setMaterialTypeFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Tipo de material" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los tipos</SelectItem>
                            {Object.entries(MATERIAL_TYPE_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={stateFilter} onValueChange={setStateFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Estado" />
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

                {/* Materials Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredMaterials.map((material) => (
                        <Card key={material.id} className="overflow-hidden">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{material.title}</CardTitle>
                                        <CardDescription>
                                            {material.quantity} kg • {material.user.name}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary">{MATERIAL_TYPE_LABELS[material.materialType]}</Badge>
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

                                <div className="bg-muted/50 p-3 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Precio total:</span>
                                        <span className="text-lg font-bold text-primary">
                                            ${calculateTotal(material.materialType, material.quantity)} MXN
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        ${MATERIAL_PRICES[material.materialType]} MXN por kg
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openGoogleMaps(material.latitude, material.longitude)}
                                        className="flex-1 bg-transparent"
                                    >
                                        <MapPin className="mr-1 h-3 w-3" />
                                        ¿Cómo llegar?
                                    </Button>

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm" className="flex-1" onClick={() => setSelectedMaterial(material)}>
                                                <ShoppingCart className="mr-1 h-3 w-3" />
                                                Comprar
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Realizar Compra de Material Reciclable</DialogTitle>
                                                <DialogDescription>Completa la información para proceder con la compra</DialogDescription>
                                            </DialogHeader>

                                            {selectedMaterial && (
                                                <form onSubmit={handleSubmit(onPurchaseSubmit)} className="space-y-4">
                                                    {/* Material Info */}
                                                    <div className="bg-muted/50 p-4 rounded-lg">
                                                        <h3 className="font-semibold mb-2">Información del Material</h3>
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <div>
                                                                <span className="font-medium">Tipo:</span>{" "}
                                                                {MATERIAL_TYPE_LABELS[selectedMaterial.materialType]}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Cantidad:</span> {selectedMaterial.quantity} kg
                                                            </div>
                                                            <div className="col-span-2">
                                                                <span className="font-medium">Total a pagar:</span>{" "}
                                                                <span className="text-lg font-bold text-primary">
                                                                    ${calculateTotal(selectedMaterial.materialType, selectedMaterial.quantity)} MXN
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Company Info */}
                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="companyName">Nombre de la Empresa</Label>
                                                            <Input id="companyName" {...register("companyName")} disabled={isPurchasing} />
                                                            {errors.companyName && (
                                                                <p className="text-sm text-destructive">{errors.companyName.message}</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="companyRfc">RFC de la Empresa</Label>
                                                            <Input id="companyRfc" {...register("companyRfc")} disabled={isPurchasing} />
                                                            {errors.companyRfc && (
                                                                <p className="text-sm text-destructive">{errors.companyRfc.message}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="companyAddress">Dirección de la Empresa</Label>
                                                            <Input id="companyAddress" {...register("companyAddress")} disabled={isPurchasing} />
                                                            {errors.companyAddress && (
                                                                <p className="text-sm text-destructive">{errors.companyAddress.message}</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="companyPhone">Teléfono de la Empresa</Label>
                                                            <Input id="companyPhone" {...register("companyPhone")} disabled={isPurchasing} />
                                                            {errors.companyPhone && (
                                                                <p className="text-sm text-destructive">{errors.companyPhone.message}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Transporter Info */}
                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="transporterName">Nombre del Transportista</Label>
                                                            <Input id="transporterName" {...register("transporterName")} disabled={isPurchasing} />
                                                            {errors.transporterName && (
                                                                <p className="text-sm text-destructive">{errors.transporterName.message}</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="transporterPhone">Teléfono del Transportista</Label>
                                                            <Input id="transporterPhone" {...register("transporterPhone")} disabled={isPurchasing} />
                                                            {errors.transporterPhone && (
                                                                <p className="text-sm text-destructive">{errors.transporterPhone.message}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="transporterInfo">
                                                            Información del Transportista (RFC, CURP, Matrícula, etc.)
                                                        </Label>
                                                        <Input id="transporterInfo" {...register("transporterInfo")} disabled={isPurchasing} />
                                                        {errors.transporterInfo && (
                                                            <p className="text-sm text-destructive">{errors.transporterInfo.message}</p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="collectionDate">Fecha y Hora de Recolección</Label>
                                                        <Input
                                                            id="collectionDate"
                                                            type="datetime-local"
                                                            {...register("collectionDate")}
                                                            disabled={isPurchasing}
                                                        />
                                                        {errors.collectionDate && (
                                                            <p className="text-sm text-destructive">{errors.collectionDate.message}</p>
                                                        )}
                                                    </div>

                                                    {/* Customer Info for Payment */}
                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="customerName">Nombre del Cliente</Label>
                                                            <Input id="customerName" {...register("customerName")} disabled={isPurchasing} />
                                                            {errors.customerName && (
                                                                <p className="text-sm text-destructive">{errors.customerName.message}</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="customerEmail">Email del Cliente</Label>
                                                            <Input
                                                                id="customerEmail"
                                                                type="email"
                                                                {...register("customerEmail")}
                                                                disabled={isPurchasing}
                                                            />
                                                            {errors.customerEmail && (
                                                                <p className="text-sm text-destructive">{errors.customerEmail.message}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Button type="submit" className="w-full" disabled={isPurchasing}>
                                                        {isPurchasing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Proceder al Pago
                                                    </Button>
                                                </form>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredMaterials.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No se encontraron materiales disponibles</p>
                    </div>
                )}
            </div>
        </div>
    )
}
