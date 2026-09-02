"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";

interface PublicNavProps {
  activeLink?: string;
  variant?: "light" | "dark";
}

export function PublicNav({ activeLink, variant = "light" }: PublicNavProps) {
  const [open, setOpen] = useState(false);

  const dark = variant === "dark";

  return (
    <div
      className="sticky top-0 z-50"
      style={dark
        ? { background: "rgba(30,58,168,0.82)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.10)" }
        : { background: "rgba(247,248,250,0.9)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(233,236,239,0.6)" }
      }
    >
      <div className="flex items-center max-w-[1180px] mx-auto px-4 sm:px-8 py-3" style={{ gap: 40 }}>
        <Link href="/" onClick={() => setOpen(false)} style={{ display: "flex", flexShrink: 0 }}>
          <Logo height={50} darkText={!dark} />
        </Link>
        <div className="hidden md:flex items-center ml-auto" style={{ gap: 28 }}>
          {[
            { href: "/#como-funciona", label: "Cómo funciona" },
            { href: "/#productos",     label: "Productos" },
            { href: "/#calculadora",   label: "Calculadora" },
            { href: "/#contacto",      label: "Contacto" },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className="font-medium hover:opacity-100 transition-opacity"
              style={{ fontSize: 15, color: dark ? "rgba(255,255,255,0.78)" : "#5B6577" }}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/login"
            className="font-semibold transition-colors"
            style={{
              fontSize: 14,
              border: dark ? "1px solid rgba(255,255,255,0.35)" : "1px solid #DCE0E5",
              borderRadius: 999,
              padding: "9px 18px",
              color: dark ? "#fff" : "#0C2A45",
              background: "transparent",
            }}
          >
            Ingresar
          </Link>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border-0 cursor-pointer bg-transparent ml-auto"
          style={{ color: dark ? "#fff" : "#0C2A45" }}
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
        <div className="md:hidden flex flex-col gap-1 px-4 pb-5"
          style={{ borderTop: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(233,236,239,0.6)" }}
        >
          {[
            { href: "/#como-funciona", label: "Cómo funciona" },
            { href: "/#productos",     label: "Productos" },
            { href: "/#calculadora",   label: "Calculadora" },
            { href: "/#contacto",      label: "Contacto" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="font-medium py-3"
              style={{ fontSize: 14.5, color: dark ? "rgba(255,255,255,0.85)" : "#5B6577" }}
            >
              {label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)}
            className="font-semibold rounded-[10px] px-[18px] py-[11px] text-center mt-1"
            style={{ fontSize: 14.5, background: dark ? "rgba(255,255,255,0.14)" : "#0C2A45", color: "#fff" }}
          >
            Ingresar
          </Link>
        </div>
      )}
    </div>
  );
}
