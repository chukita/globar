"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";

interface PublicNavProps {
  activeLink?: string;
}

export function PublicNav({ activeLink }: PublicNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 bg-[#F7F8FA]/90 backdrop-blur-sm border-b border-[#E9ECEF]/60">
    <div className="flex items-center justify-between max-w-[1180px] mx-auto px-4 sm:px-8 py-[18px] sm:py-[22px]">
      <Link href="/" onClick={() => setOpen(false)}>
        <Logo size="md" darkText />
      </Link>
      <div className="hidden md:flex items-center gap-[26px]">
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
          href="/login"
          className="text-[14.5px] font-semibold bg-[#0C2A45] text-white rounded-[10px] px-[18px] py-[11px]"
        >
          Ingresar
        </Link>
      </div>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border-0 cursor-pointer bg-transparent text-[#0C2A45]"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </div>
    {open && (
      <div className="md:hidden flex flex-col gap-1 px-4 pb-5 border-t border-[#E9ECEF]/60">
        <Link href="/#como-funciona" onClick={() => setOpen(false)} className="text-[14.5px] font-medium text-[#5B6577] py-3">
          Cómo funciona
        </Link>
        <Link href="/#productos" onClick={() => setOpen(false)} className="text-[14.5px] font-medium text-[#5B6577] py-3">
          Productos
        </Link>
        <Link
          href="/revendedores"
          onClick={() => setOpen(false)}
          className="text-[14.5px] py-3"
          style={{ color: activeLink === "revendedores" ? "#0E6BA8" : "#5B6577", fontWeight: activeLink === "revendedores" ? 600 : 500 }}
        >
          Revendedores
        </Link>
        <Link
          href="/login"
          onClick={() => setOpen(false)}
          className="text-[14.5px] font-semibold bg-[#0C2A45] text-white rounded-[10px] px-[18px] py-[11px] text-center mt-1"
        >
          Ingresar
        </Link>
      </div>
    )}
    </div>
  );
}
