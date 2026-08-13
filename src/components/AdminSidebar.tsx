"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { logoutAction } from "@/lib/actions";

const NAV = [
  { href: "/admin",              label: "Dashboard",      icon: "▪" },
  { href: "/admin/ventas",       label: "Ventas",         icon: "▪" },
  { href: "/admin/comisiones",   label: "Comisiones",     icon: "▪" },
  { href: "/admin/facturas",     label: "Facturas",       icon: "▪" },
  { href: "/admin/revendedores", label: "Revendedores",   icon: "▪" },
  { href: "/admin/configuracion", label: "Configuración", icon: "▪" },
];

export function AdminSidebar() {
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
        className={`w-[236px] flex-shrink-0 bg-[#0C2A45] flex flex-col p-6 min-h-screen
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:z-auto`}
      >
      <div className="flex items-center justify-between px-2 pb-2 mb-4 lg:block">
        <div>
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <div className="mt-2 px-0">
            <span className="text-[11px] font-semibold uppercase tracking-[.1em] text-[#FADADD]">
              Superadmin
            </span>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg border-0 cursor-pointer flex-shrink-0"
          style={{ background: "rgba(255,255,255,.08)", color: "#9DA7B5" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14.5px] transition-colors"
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

      <div className="mt-auto flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,.04)" }}>
        <div className="w-9 h-9 rounded-full bg-[#FADADD] flex items-center justify-center font-bold text-[#9B4A57] text-sm flex-shrink-0">
          SA
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-semibold text-white truncate">Grupo Globaliza</div>
          <div className="text-[11.5px] text-[#8595A8]">Superadmin</div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            title="Cerrar sesión"
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer border-0"
            style={{ background: "rgba(255,255,255,.06)", color: "#9DA7B5" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
