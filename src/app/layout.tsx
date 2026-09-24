import type { Metadata } from "next";
import { Open_Sans, Figtree, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { FirstTouch } from "@/components/FirstTouch";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-open-sans",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-figtree",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const DESCRIPTION =
  "Programa de revendedores de Agenda Online y NuMe: registrate gratis, compartí tu link y cobrá comisiones mensuales por cada cliente que se suscribe. Sin inversión inicial, en Argentina.";

export const metadata: Metadata = {
  metadataBase: new URL("https://glob.ar"),
  title: {
    default: "glob.ar — Revendé software y cobrá comisiones mensuales",
    template: "%s | glob.ar",
  },
  description: DESCRIPTION,
  keywords: [
    "programa de revendedores", "revender software", "ganar comisiones", "trabajo desde casa Argentina",
    "ingresos extra", "reventa SaaS", "Agenda Online", "NuMe", "afiliados Argentina",
  ],
  openGraph: {
    type: "website",
    siteName: "glob.ar",
    locale: "es_AR",
    url: "https://glob.ar/",
    title: "glob.ar — Revendé software y cobrá comisiones mensuales",
    description: DESCRIPTION,
    images: [{ url: "/logo-glob.png" }],
  },
  twitter: {
    card: "summary",
    title: "glob.ar — Revendé software y cobrá comisiones mensuales",
    description: DESCRIPTION,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${openSans.variable} ${figtree.variable} ${jetbrainsMono.variable} ${openSans.className}`}>
        <FirstTouch />
        {children}
      </body>
    </html>
  );
}
