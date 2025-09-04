import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Recycle, School, Building2, Leaf, Users, TrendingUp, MapPin, Clock, Shield } from "lucide-react"
import { Navigation } from "@/components/ui/navigation"
import Image from "next/image"

export default function MaterialesReciclablesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-slate-50 py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4 bg-lime-500 text-white hover:bg-lime-600">
              <Leaf className="mr-2 h-4 w-4" />
              Plataforma Sustentable
            </Badge>
            <h1 className="mb-6 text-4xl font-bold text-balance sm:text-5xl lg:text-6xl text-slate-600">
              En <b className="text-schoMetricsBaseColor">SchoMetrics</b> Conectamos <p className="text-lime-400">Escuelas</p>
              con
              <br />
              <span className="text-emerald-600"> Empresas Recicladoras</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground text-balance sm:text-xl">
              Permitimos a las escuelas de todo México publicar fácilmente sus materiales reciclables como plástico,
              papel, vidrio, metal y más, para conectar directamente con empresas de reciclaje comprometidas.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="text-lg bg-transparent text-lime-600 hover:text-lime-700 border-2 border-lime-500 hover:bg-white">
                <Link href="/escuelas/iniciar-sesion">
                  <School className="mr-2 h-5 w-5" />
                  Soy una Escuela
                </Link>
              </Button>
              <Button asChild size="lg" className="text-lg bg-transparent text-emerald-600 hover:text-emerald-700 border-2 border-emerald-500 hover:bg-white">
                <Link href="/empresas/iniciar-sesion">
                  <Building2 className="mr-2 h-5 w-5" />
                  Soy una Empresa
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl text-schoMetricsBaseColor">Nuestra Misión</h2>
            <p className="text-lg text-muted-foreground text-balance">
              Crear un ecosistema sustentable donde las escuelas puedan monetizar sus materiales reciclables mientras
              contribuyen al cuidado del medio ambiente.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-schoMetricsBaseColor/10">
                  <Recycle className="h-8 w-8 text-schoMetricsBaseColor" />
                </div>
                <CardTitle>Reciclaje Inteligente</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Facilitamos la conexión entre escuelas y empresas recicladoras para una venta de materiales reciclables más eficiente y transparente.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-schoMetricsBaseColor/10">
                  <Users className="h-8 w-8 text-schoMetricsBaseColor" />
                </div>
                <CardTitle>Conexión Directa</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Conectamos directamente escuelas con empresas recicladoras sin intermediarios innecesarios.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-schoMetricsBaseColor/10">
                  <TrendingUp className="h-8 w-8 text-schoMetricsBaseColor" />
                </div>
                <CardTitle>Impacto Positivo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Generamos ingresos adicionales para las escuelas mientras promovemos la cultura del reciclaje.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl text-schoMetricsBaseColor">Características de la Plataforma</h2>
            <p className="text-lg text-muted-foreground text-balance">
              Herramientas diseñadas para hacer el proceso de reciclaje simple, seguro y rentable.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-schoMetricsBaseColor/10">
                  <MapPin className="h-6 w-6 text-schoMetricsBaseColor" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-schoMetricsBaseColor">Localización</h3>
                  <p className="text-muted-foreground">
                    Mapas integrados para facilitar la ubicación y recolección de materiales.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-schoMetricsBaseColor/10">
                  <Clock className="h-6 w-6 text-schoMetricsBaseColor" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-schoMetricsBaseColor">Programación Flexible</h3>
                  <p className="text-muted-foreground">
                    Las escuelas pueden establecer horarios de recolección que se adapten a sus necesidades.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-schoMetricsBaseColor/10">
                  <Shield className="h-6 w-6 text-schoMetricsBaseColor" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-schoMetricsBaseColor">Pagos Seguros</h3>
                  <p className="text-muted-foreground">
                    Sistema de pagos integrado con Openpay para transacciones seguras y confiables.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:pl-8">
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader>
                  <CardTitle className="text-2xl">Tipos de Materiales</CardTitle>
                  <CardDescription>Aceptamos una amplia variedad de materiales reciclables</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Badge variant="outline">Plástico</Badge>
                    <Badge variant="outline">Papel</Badge>
                    <Badge variant="outline">Vidrio</Badge>
                    <Badge variant="outline">Metal</Badge>
                    <Badge variant="outline">Metal Cobre</Badge>
                    <Badge variant="outline">Orgánico</Badge>
                    <Badge variant="outline">Electrónico</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl text-schoMetricsBaseColor">¿Listo para Comenzar?</h2>
            <p className="mb-8 text-lg text-muted-foreground text-balance">
              Únete a SchoMetrics y forma parte del cambio hacia un futuro más sustentable.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="text-lg bg-transparent text-lime-600 hover:text-lime-700 border-2 border-lime-500 hover:bg-white">
                <Link href="/escuelas/iniciar-sesion">
                  <School className="mr-2 h-5 w-5" />
                  Soy una Escuela
                </Link>
              </Button>
              <Button asChild size="lg" className="text-lg bg-transparent text-emerald-600 hover:text-emerald-700 border-2 border-emerald-500 hover:bg-white">
                <Link href="/empresas/iniciar-sesion">
                  <Building2 className="mr-2 h-5 w-5" />
                  Soy una Empresa
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-end gap-2">
              <Image src="/schometrics-logo.png" alt="schometrics-logo" width={100} height={100} priority />
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SchoMetrics. Conectando escuelas con empresas recicladoras en México.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
