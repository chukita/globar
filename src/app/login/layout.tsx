import type { Metadata } from "next";

// La página es client component y no puede exportar metadata.
export const metadata: Metadata = {
  title: "Ingresar",
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
