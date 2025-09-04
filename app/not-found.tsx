import Link from "next/link"
import { Leaf, ArrowLeftCircle } from "lucide-react"
import Image from "next/image"
export default function NotFound() {
    return (
        <div className="not-found min-h-screen flex items-center justify-center p-4">
            <div className="max-w-2xl mx-auto text-center space-y-8">
                {/* Header with Logo */}
                <div className="space-y-4">
                    <div className="flex items-end justify-center text-center space-x-3">
                        <Image src="/schometrics-logo-white.png" alt="schometrics-logo" width={150} height={150} priority />

                        <h1 className="text-xl font-bold text-white md:text-2xl lg:text-3xl">SchoMetrics</h1>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-8xl font-bold text-blue-500 animate-pulse">404</h2>
                        <h3 className="text-2xl font-semibold text-white">¡Ups! No pudimos encontrar esa página</h3>
                    </div>
                </div>

                {/* Environmental Illustration */}
                <div className="relative">
                    <div className="w-64 h-64 mx-auto bg-gradient-to-br from-primary/40 to-accent/30 rounded-full flex items-center justify-center">
                        <div className="relative">
                            {/* Tree illustration using CSS */}
                            <div className="w-32 h-32 relative">
                                {/* Tree trunk */}
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-12 bg-amber-600 rounded-sm"></div>
                                {/* Tree foliage */}
                                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-primary rounded-full opacity-80"></div>
                                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-accent rounded-full opacity-70"></div>
                                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-secondary rounded-full opacity-70"></div>
                                {/* Leaves floating */}
                                <div
                                    className="absolute -top-2 -right-4 w-3 h-3 bg-primary rounded-full animate-bounce"
                                    style={{ animationDelay: "0s" }}
                                ></div>
                                <div
                                    className="absolute -top-4 -left-2 w-2 h-2 bg-accent rounded-full animate-bounce"
                                    style={{ animationDelay: "0.5s" }}
                                ></div>
                                <div
                                    className="absolute -top-1 right-8 w-2 h-2 bg-secondary rounded-full animate-bounce"
                                    style={{ animationDelay: "1s" }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/" className="py-2 px-4 flex gap-2 justify-center items-center rounded-md bg-schoMetricsBaseColor/80 text-white hover:bg-schoMetricsBaseColor">
                        <ArrowLeftCircle className="w-5 h-5 mr-2" />
                        Volver al Inicio
                    </Link>
                </div>

                {/* Footer Message */}
                <div className="pt-8 border-t border-border">
                    <p className="text-slate-300">
                        <span className="font-semibold text-schoMetricsBaseColor">SchoMetrics</span> - Transformación educativa hacia la sostenibilidad ambiental
                    </p>
                    <div className="flex justify-center space-x-4 mt-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer animate-heartbeat">
                            <Leaf className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
