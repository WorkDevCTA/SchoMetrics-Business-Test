"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MATERIAL_TYPE_LABELS } from "@/lib/constants"
import type { MaterialType, PaymentStatus } from "@prisma/client"
import { Download, FileText } from "lucide-react"
import toast from "react-hot-toast"
import useUserSession from "@/hooks/useUserSession"
import { CompanyNavigation } from "@/app/components/company/company-navigation"

interface Purchase {
  id: string
  folioNumber: string
  companyName: string
  companyRfc: string
  totalAmount: number
  paymentStatus: PaymentStatus
  collectionDate: string
  createdAt: string
  recyclableMaterial: {
    title: string
    materialType: MaterialType
    quantity: number
    user: {
      name: string
    }
  }
}

export default function PurchasedMaterialsPage({ params }: { params: { userId: string } }) {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { session } = useUserSession()

  useEffect(() => {
    fetchPurchases()
  }, [params.userId])

  const fetchPurchases = async () => {
    try {
      const response = await fetch(`/api/purchases/user/${params.userId}`)
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

  const downloadReceipt = async (purchaseId: string) => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}/receipt`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `comprobante-${purchaseId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        toast.error("Error al descargar comprobante")
      }
    } catch (error) {
      toast.error("Error al descargar comprobante")
    }
  }

  const downloadPurchaseReport = async () => {
    try {
      const response = await fetch(`/api/purchases/user/${params.userId}/report`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `informe-compras-${new Date().toISOString().split("T")[0]}.pdf`
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CompanyNavigation />
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">Cargando compras...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <CompanyNavigation />

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mis Compras</h1>
            <p className="text-muted-foreground">Historial de materiales reciclables comprados</p>
          </div>
          {purchases.length > 0 && (
            <Button onClick={downloadPurchaseReport} variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Descargar Informe de Compras
            </Button>
          )}
        </div>

        {purchases.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Compras</CardTitle>
              <CardDescription>Lista completa de todas tus compras realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Folio</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Escuela</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha de Compra</TableHead>
                      <TableHead>Recolección</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-mono text-sm">{purchase.folioNumber}</TableCell>
                        <TableCell className="font-medium">{purchase.recyclableMaterial.title}</TableCell>
                        <TableCell>{purchase.recyclableMaterial.user.name}</TableCell>
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
                        <TableCell>
                          {purchase.paymentStatus === "COMPLETED" && (
                            <Button size="sm" variant="outline" onClick={() => downloadReceipt(purchase.id)}>
                              <Download className="mr-1 h-3 w-3" />
                              Comprobante
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No has realizado compras aún</p>
            <Button asChild>
              <a href="/materiales-reciclables/empresas/materiales-disponibles">Explorar Materiales Disponibles</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
