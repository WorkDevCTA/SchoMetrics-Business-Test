"use client";

import type React from "react"; // Necesario para Suspense
import Link from "next/link";
import SchoolLoginForm from "./SchoolLoginForm"; // Importa el nuevo componente cliente
import { Suspense } from "react"; // Importa Suspense
import { motion } from 'motion/react';

function LoginFormSkeleton() {
    return (
        <div className="w-full max-w-md animate-pulse space-y-6 rounded-lg bg-white p-8 shadow-md">
            <div className="space-y-2 text-center">
                <div className="mx-auto h-6 w-3/4 rounded bg-gray-300"></div>
                <div className="mx-auto h-4 w-full rounded bg-gray-300"></div>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="h-4 w-1/4 rounded bg-gray-300"></div>
                    <div className="h-10 w-full rounded bg-gray-300"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 w-1/4 rounded bg-gray-300"></div>
                    <div className="h-10 w-full rounded bg-gray-300"></div>
                </div>
                <div className="mt-6 h-8 w-full rounded bg-green-300"></div>
                <div className="mx-auto mt-4 h-4 w-1/2 rounded bg-gray-300"></div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-lime-300 via-lime-50 to-lime-300 py-10">
            <motion.div
                initial={{ opacity: 0.0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 0.3,
                    duration: 0.8,
                    ease: "easeInOut",
                }}
                className="relative flex min-h-screen flex-col items-center justify-center"
            >
                <div className="">
                    <div className="px-4">
                        {/* Envuelve el componente que usa useSearchParams con Suspense */}
                        <Suspense fallback={<LoginFormSkeleton />}>
                            <SchoolLoginForm />
                        </Suspense>
                        <footer className="bottom-0 mt-10 w-full px-4 text-center text-xs text-gray-500">
                            © {new Date().getFullYear()} SchoMetrics. Todos los derechos
                            reservados.
                            <div className="mt-1">
                                <Link
                                    href="https://schometrics.website/terminos"
                                    className="hover:underline"
                                >
                                    Términos
                                </Link>{" "}
                                |{" "}
                                <Link
                                    href="https://schometrics.website/privacidad"
                                    className="hover:underline"
                                >
                                    Privacidad
                                </Link>
                            </div>
                        </footer>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
