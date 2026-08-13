"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Logo } from "./Logo";

const NAV = [
  { href: "/panel/productos",    label: "Mis productos" },
  { href: "/panel/clientes",     label: "Mis clientes" },
  { href: "/panel/comisiones",   label: "Comisiones" },
  { href: "/panel/facturas",     label: "Facturas" },
  { href: "/panel/capacitacion", label: "Capacitación" },
  { href: "/panel/perfil",       label: "Perfil y código" },
];

interface SidebarProps {
  resellerName?: string;
  resellerInitials?: string;
  role?: string;
}

export function Sidebar({ resellerName = "Martina Quiroga", resellerInitials = "MQ", role }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <div className="lg:contents">
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-[#0C2A45] px-4 py-3">
        <Logo size="sm" />
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="w-9 h-9 flex items-center justify-center rounded-lg border-0 cursor-pointer"
          style={{ background: "rgba(255,255,255,.08)", color: "#fff" }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`w-[236px] flex-shrink-0 bg-[#0C2A45] flex flex-col p-6 pt-6 pb-4 min-h-screen
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:z-auto`}
      >
      <div className="flex items-center justify-between px-2 pb-6 lg:block">
        <Logo size="sm" />
        <button
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg border-0 cursor-pointer"
          style={{ background: "rgba(255,255,255,.08)", color: "#9DA7B5" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14.5px] font-medium transition-colors"
              style={{
                background: active ? "rgba(14,107,168,.22)" : "transparent",
                color: active ? "#BBD9EE" : "#9DA7B5",
                fontWeight: active ? 600 : 500,
              }}
            >
              <span
                className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                style={{ background: active ? "#0E6BA8" : "#3A4A5E" }}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {role === "superadmin" && (
        <Link
          href="/admin"
          className="mt-4 flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors no-underline"
          style={{ background: "rgba(250,218,221,.10)", color: "#FADADD" }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 1.5L9.5 5.5H13.5L10.5 8L11.5 12.5L7.5 10L3.5 12.5L4.5 8L1.5 5.5H5.5L7.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
          Panel de administración
        </Link>
      )}

      <div className="mt-auto flex flex-col gap-2">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-[#8595A8] hover:text-[#C0CDD8] hover:bg-white/5 transition-colors border-0 bg-transparent cursor-pointer text-left"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M5.5 13H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h2.5M10 10.5l3-3-3-3M13 7.5H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Cerrar sesión
        </button>

        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,.04)" }}>
          <div className="w-9 h-9 rounded-full bg-[#0E6BA8] flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
            {resellerInitials}
          </div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-semibold text-white truncate">{resellerName}</div>
            <div className="text-[11.5px] text-[#8595A8]">Revendedor</div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
