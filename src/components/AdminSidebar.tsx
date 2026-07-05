"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

const NAV = [
  { href: "/admin",              label: "Dashboard",      icon: "▪" },
  { href: "/admin/ventas",       label: "Ventas",         icon: "▪" },
  { href: "/admin/comisiones",   label: "Comisiones",     icon: "▪" },
  { href: "/admin/facturas",     label: "Facturas",       icon: "▪" },
  { href: "/admin/revendedores", label: "Revendedores",   icon: "▪" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-[236px] flex-shrink-0 bg-[#0C2A45] flex flex-col p-6 min-h-screen">
      <div className="px-2 pb-2 mb-4">
        <Logo size="sm" />
        <div className="mt-2 px-0">
          <span className="text-[11px] font-semibold uppercase tracking-[.1em] text-[#FADADD]">
            Superadmin
          </span>
        </div>
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
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold text-white truncate">Grupo Globaliza</div>
          <div className="text-[11.5px] text-[#8595A8]">Superadmin</div>
        </div>
      </div>
    </div>
  );
}
