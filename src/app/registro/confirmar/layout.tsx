import type { Metadata } from "next";

// Paso intermedio del alta: no tiene sentido indexarlo ni heredar el
// canonical de /registro.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
