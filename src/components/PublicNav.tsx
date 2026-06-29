import Link from "next/link";
import { Logo } from "./Logo";

interface PublicNavProps {
  activeLink?: string;
}

export function PublicNav({ activeLink }: PublicNavProps) {
  return (
    <div className="flex items-center justify-between max-w-[1180px] mx-auto px-8 py-[22px]">
      <Link href="/">
        <Logo size="md" darkText />
      </Link>
      <div className="flex items-center gap-[26px]">
        <Link href="/#como-funciona" className="text-[14.5px] font-medium text-[#5B6577]">
          Cómo funciona
        </Link>
        <Link href="/#productos" className="text-[14.5px] font-medium text-[#5B6577]">
          Productos
        </Link>
        <Link
          href="/revendedores"
          className="text-[14.5px] font-medium"
          style={{ color: activeLink === "revendedores" ? "#0E6BA8" : "#5B6577", fontWeight: activeLink === "revendedores" ? 600 : 500 }}
        >
          Revendedores
        </Link>
        <Link
          href="/panel/comisiones"
          className="text-[14.5px] font-semibold bg-[#0C2A45] text-white rounded-[10px] px-[18px] py-[11px]"
        >
          Ingresar
        </Link>
      </div>
    </div>
  );
}
