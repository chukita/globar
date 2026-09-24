import type { Metadata } from "next";

// La página es client component y no puede exportar metadata.
export const metadata: Metadata = {
  title: "Registrate como revendedor",
  description: "Creá gratis tu cuenta de revendedor de glob.ar y obtené tu link para vender Agenda Online y NuMe con comisiones mensuales.",
  alternates: { canonical: "/registro" },
};

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return children;
}
