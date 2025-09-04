import type { Metadata } from "next";
import "./globals.css";
import { plusJakarta } from "@/fonts/fonts";
import ScrollToTopButton from "./components/ScrollToTopButton";
import { ToastProvider } from "./components/ToastProvider";

export const metadata: Metadata = {
  title: "SchoMetrics | Escuelas y Empresas de Reciclaje",
  description: "¿Tu Escuela tiene Materiales Reciclables? Con SchoMetrics podrás publicarlos y una Empresa de Reciclaje los comprará",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="apple-mobile-web-app-title" content="SchoMetrics" />
        {/* opengraph-image */}
        <meta property="og:image" content="/schometrics-logo.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1769" />
        <meta property="og:image:height" content="833" />
        {/* More Metadata */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SchoMetrics - Plataforma de sostenibilidad ambiental para escuelas" />
        <meta name="twitter:description" content="SchoMetrics conecta tu escuela con las empresas de reciclaje" />
        <meta name="twitter:image" content="/schometrics.png" />
      </head>
      <body className={`${plusJakarta.className}`}>
        <ScrollToTopButton />
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
