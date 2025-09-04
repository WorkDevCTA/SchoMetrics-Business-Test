"use client"

import { useState, useEffect } from "react"
import { AdminNavigation } from "@/components/admin/admin-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MATERIAL_TYPE_LABELS } from "@/lib/constants"
import type { MaterialType, PaymentStatus } from "@prisma/client"
import { FileText } from "lucide-react"
import toast from "react-hot-toast"

interface Purchase {
  id: string
  folioNumber: string
  companyName: string
  companyRfc: string
  totalAmount: number
  paymentStatus: PaymentStatus
  collectionDate: string
  createdAt: string
  user: {
    name: string
    userType: string
  }
  recyclableMaterial: {
    title: string
    materialType: MaterialType
    quantity: number
    user: {
      name: string
    }
  }
}

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      const response = await fetch("/api/admin/purchases")
      if (response.ok) {
        const data = await response.json()
        setPurchases(data)
      }
    } catch (error) {
      toast.error("Error al cargar compras")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadAllPurchasesReport = async () => {
    try {
      const response = await fetch("/api/admin/purchases/report")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `informe-todas-las-compras-${new Date().toISOString().split("T")[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        toast.error("Error al descargar informe")
      }
    } catch (error) {
      toast.error("Error al descargar informe")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="default">Completado</Badge>
      case "PENDING":
        return <Badge variant="secondary">Pendiente</Badge>
      case "FAILED":
        return <Badge variant="destructive">Fallido</Badge>
      case "CANCELLED":
        return <Badge variant="outline">Cancelado</Badge>
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const calculateTotalRevenue = () => {
    return purchases
      .filter((p) => p.paymentStatus === "COMPLETED")
      .reduce((total, purchase) => total + purchase.totalAmount, 0)
      .toFixed(2)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavigation />
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">Cargando compras...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Materiales Comprados - Vista Administrador</h1>
            <p className="text-muted-foreground">Todas las compras realizadas en la plataforma</p>
          </div>
          {purchases.length > 0 && (
            <Button onClick={downloadAllPurchasesReport} variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Descargar Informe General
            </Button>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Compras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchases.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compras Completadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {purchases.filter((p) => p.paymentStatus === "COMPLETED").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${calculateTotalRevenue()} MXN</div>
            </CardContent>
          </Card>
        </div>

        {/* Purchases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Historial Completo de Compras</CardTitle>
            <CardDescription>Lista de todas las transacciones realizadas en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Folio</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Escuela</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de Compra</TableHead>
                    <TableHead>Recolección</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-mono text-sm">{purchase.folioNumber}</TableCell>
                      <TableCell className="font-medium">{purchase.recyclableMaterial.title}</TableCell>
                      <TableCell>{purchase.recyclableMaterial.user.name}</TableCell>
                      <TableCell>{purchase.companyName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {MATERIAL_TYPE_LABELS[purchase.recyclableMaterial.materialType]}
                        </Badge>
                      </TableCell>
                      <TableCell>{purchase.recyclableMaterial.quantity} kg</TableCell>
                      <TableCell className="font-semibold">${purchase.totalAmount.toFixed(2)} MXN</TableCell>
                      <TableCell>{getStatusBadge(purchase.paymentStatus)}</TableCell>
                      <TableCell>{formatDate(purchase.createdAt)}</TableCell>
                      <TableCell>{formatDate(purchase.collectionDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {purchases.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No se han realizado compras aún</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
