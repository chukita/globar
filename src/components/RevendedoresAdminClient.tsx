"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { fmtARS } from "@/lib/constants";
import { toggleRevendedorActivoAction, toggleHabilitacionAction, eliminarRevendedorAction } from "@/lib/actions";
import { ConfirmarEliminacionModal } from "@/components/ConfirmarEliminacionModal";
import { ConfirmarModal } from "@/components/ConfirmarModal";

interface Producto {
  id: string;
  nombre: string;
  habilitado: boolean;
}

interface Revendedor {
  id: string;
  codigoVentas: string;
  zona: string | null;
  activo: boolean;
  nombre: string | null;
  email: string;
  ventas: number;
  ingreso: number;
  productos: Producto[];
}

export function RevendedoresAdminClient({ revendedoresIniciales }: { revendedoresIniciales: Revendedor[] }) {
  const [revendedores, setRevendedores] = useState(revendedoresIniciales);
  const [eliminando, setEliminando] = useState<Revendedor | null>(null);
  const [cambiandoActivo, setCambiandoActivo] = useState<Revendedor | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmarToggleActivo() {
    if (!cambiandoActivo) return;
    const r = cambiandoActivo;
    setCambiandoActivo(null);
    const nuevoEstado = !r.activo;
    setRevendedores(prev => prev.map(x => x.id === r.id ? { ...x, activo: nuevoEstado } : x));
    startTransition(() => { toggleRevendedorActivoAction(r.id, nuevoEstado); });
  }

  function toggleProducto(r: Revendedor, p: Producto) {
    const nuevoEstado = !p.habilitado;
    setRevendedores(prev => prev.map(x => x.id === r.id
      ? { ...x, productos: x.productos.map(pp => pp.id === p.id ? { ...pp, habilitado: nuevoEstado } : pp) }
      : x));
    startTransition(() => { toggleHabilitacionAction(r.id, p.id, nuevoEstado); });
  }

  function confirmarEliminar() {
    if (!eliminando) return;
    const r = eliminando;
    setEliminando(null);
    setRevendedores(prev => prev.filter(x => x.id !== r.id));
    startTransition(() => { eliminarRevendedorAction(r.id); });
  }

  return (
    <div className="p-10">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Revendedores</h1>
          <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">
            Se dan de alta solos al loguearse por primera vez. Acá los activás y les habilitás productos.
          </p>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        {[
          { label: "Activos",   value: revendedores.filter(r => r.activo).length,  color: "#0B6B47" },
          { label: "Inactivos", value: revendedores.filter(r => !r.activo).length, color: "#9AA3B2" },
          { label: "Total",     value: revendedores.length,                        color: "#0C2A45" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#E9ECEF] rounded-[14px] px-5 py-3.5 flex items-center gap-3">
            <span className="font-extrabold text-[22px]" style={{ color: s.color }}>{s.value}</span>
            <span className="text-[13px] text-[#5B6577]">{s.label}</span>
          </div>
        ))}
      </div>

      {revendedores.length === 0 ? (
        <div className="bg-white border border-[#E9ECEF] rounded-[18px] mt-5 px-6 py-12 text-center text-[14px] text-[#9AA3B2]">
          Todavía no se registró ningún revendedor.
        </div>
      ) : (
        <div className="bg-white border border-[#E9ECEF] rounded-[18px] mt-5 overflow-hidden">
          <div className="overflow-x-auto">
          <div className="px-6 py-3 bg-[#F8FAFB] text-xs font-semibold uppercase tracking-[.04em] text-[#9AA3B2] min-w-[760px]"
            style={{ display: "grid", gridTemplateColumns: "1.3fr .9fr .8fr .8fr 1.3fr .7fr .6fr" }}>
            <span>Revendedor</span>
            <span>Código</span>
            <span>Ventas</span>
            <span>Cobrado</span>
            <span>Productos</span>
            <span>Estado</span>
            <span className="text-right"></span>
          </div>
          {revendedores.map((r) => (
            <div key={r.id} className="px-6 py-4 border-t border-[#F1F3F5] items-center text-[14px] min-w-[760px]"
              style={{ display: "grid", gridTemplateColumns: "1.3fr .9fr .8fr .8fr 1.3fr .7fr .6fr" }}>
              <div>
                <Link href={`/admin/revendedores/${r.id}`} className="font-semibold text-[#0C2A45] hover:text-[#0B5A8F] hover:underline">
                  {r.nombre ?? "—"}
                </Link>
                <div className="text-[11.5px] text-[#9AA3B2] mt-0.5">{r.email}</div>
              </div>
              <span className="font-mono text-[12.5px] font-semibold text-[#0B5A8F] bg-[#E1EFF8] px-2 py-1 rounded-lg self-start">{r.codigoVentas}</span>
              <span className="font-semibold">{r.ventas}</span>
              <span className="text-[13px] text-[#5B6577]">{fmtARS(r.ingreso)}</span>
              <div className="flex gap-1.5 flex-wrap">
                {r.productos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggleProducto(r, p)}
                    className="text-[11.5px] font-semibold rounded-full px-2.5 py-1 cursor-pointer border-0"
                    style={{
                      background: p.habilitado ? "#E7F5EE" : "#F0F2F5",
                      color: p.habilitado ? "#0B6B47" : "#9AA3B2",
                    }}
                    title={p.habilitado ? "Click para deshabilitar" : "Click para habilitar"}
                  >
                    {p.nombre}
                  </button>
                ))}
              </div>
              <span>
                <button
                  onClick={() => setCambiandoActivo(r)}
                  className="text-[12px] font-semibold rounded-full px-3 py-1.5 inline-block cursor-pointer border-0"
                  style={{
                    background: r.activo ? "#E7F5EE" : "#EEF0F2",
                    color: r.activo ? "#0B6B47" : "#5B6577",
                  }}
                >
                  {r.activo ? "Activo" : "Inactivo"}
                </button>
              </span>
              <span className="text-right">
                <button
                  onClick={() => setEliminando(r)}
                  className="text-[12px] font-semibold rounded-full px-3 py-1.5 inline-block cursor-pointer border-0 bg-[#FCE6E9] text-[#9B4A57]"
                  title="Borrar revendedor y todo lo asociado"
                >
                  Eliminar
                </button>
              </span>
            </div>
          ))}
          </div>
        </div>
      )}

      <ConfirmarModal
        open={!!cambiandoActivo}
        titulo={cambiandoActivo?.activo ? "Desactivar revendedor" : "Activar revendedor"}
        mensaje={`Se le va a enviar un email a ${cambiandoActivo?.nombre ?? cambiandoActivo?.email ?? "este revendedor"} avisándole que su cuenta fue ${cambiandoActivo?.activo ? "desactivada" : "activada"}.`}
        textoConfirmar={cambiandoActivo?.activo ? "Desactivar" : "Activar"}
        onConfirm={confirmarToggleActivo}
        onCancel={() => setCambiandoActivo(null)}
      />

      <ConfirmarEliminacionModal
        open={!!eliminando}
        titulo={`Eliminar a ${eliminando?.nombre ?? eliminando?.email ?? "revendedor"}`}
        advertencia="Pierde el acceso a todas sus ventas, cuotas y facturas — incluidas las comisiones ya generadas pero no cobradas, y no va a poder cobrar comisiones de las suscripciones futuras de sus clientes. Esta acción no se puede deshacer."
        codigoEsperado={eliminando?.codigoVentas ?? ""}
        confirmando={pending}
        onConfirm={confirmarEliminar}
        onCancel={() => setEliminando(null)}
      />
    </div>
  );
}
