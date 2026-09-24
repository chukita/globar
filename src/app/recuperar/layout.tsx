import type { Metadata } from "next";

// La página es client component y no puede exportar metadata.
export const metadata: Metadata = {
  title: "Recuperar contraseña",
  robots: { index: false, follow: false },
};

export default function RecuperarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
