"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

const NAV = [
  { href: "/panel/productos", label: "Mis productos" },
  { href: "/panel/comisiones", label: "Comisiones" },
  { href: "/panel/capacitacion", label: "Capacitación" },
  { href: "/panel/perfil", label: "Perfil y código" },
];

interface SidebarProps {
  resellerName?: string;
  resellerInitials?: string;
}

export function Sidebar({ resellerName = "Martina Quiroga", resellerInitials = "MQ" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-[236px] flex-shrink-0 bg-[#0C2A45] flex flex-col p-6 pt-6 pb-4 min-h-screen">
      <div className="px-2 pb-6">
        <Logo size="sm" />
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

      <div className="mt-auto flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,.04)" }}>
        <div className="w-9 h-9 rounded-full bg-[#0E6BA8] flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
          {resellerInitials}
        </div>
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold text-white truncate">{resellerName}</div>
          <div className="text-[11.5px] text-[#8595A8]">Revendedora</div>
        </div>
      </div>
    </div>
  );
}
