"use client";

import { useState, useTransition } from "react";
import { fmtARS } from "@/lib/constants";
import { actualizarProductoAction } from "@/lib/actions";

interface Producto {
  id: string;
  nombre: string;
  dominio: string;
  urlRegistro: string;
  tag: string;
  descripcion: string | null;
  precioMensual: string;
  status: "activo" | "inactivo";
}

export function ProductosAdminClient({ productosIniciales }: { productosIniciales: Producto[] }) {
  const [productos, setProductos] = useState(productosIniciales);
  const [editando, setEditando] = useState<string | null>(null);

  return (
    <div className="p-10">
      <div>
        <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Productos</h1>
        <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">
          Precio, descripción y estado de los productos que se muestran en la landing.
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-6">
        {productos.map((p) => (
          <div key={p.id} className="bg-white border-2 rounded-[18px] p-6"
            style={{ borderColor: editando === p.id ? "#0E6BA8" : "#E9ECEF" }}>
            {editando === p.id ? (
              <ProductoForm
                producto={p}
                onCancelar={() => setEditando(null)}
                onGuardado={(actualizado) => {
                  setProductos(prev => prev.map(x => x.id === p.id ? { ...x, ...actualizado } : x));
                  setEditando(null);
                }}
              />
            ) : (
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-[18px]">{p.nombre}</span>
                    <span className="text-[12px] font-semibold rounded-full px-3 py-1"
                      style={{ background: p.status === "activo" ? "#E7F5EE" : "#EEF0F2", color: p.status === "activo" ? "#0B6B47" : "#5B6577" }}>
                      {p.status === "activo" ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <div className="text-[13px] text-[#9AA3B2] mt-1">{p.dominio} · {p.tag}</div>
                  <p className="text-[14px] text-[#5B6577] mt-2 mb-0 max-w-[560px]">{p.descripcion}</p>
                  <div className="font-bold text-[18px] mt-3 text-[#0B5A8F]">{fmtARS(Number(p.precioMensual))}<span className="text-[12px] font-medium text-[#9AA3B2]">/mes</span></div>
                </div>
                <button onClick={() => setEditando(p.id)}
                  className="font-semibold text-[13.5px] bg-white text-[#0C2A45] border border-[#DCE0E5] rounded-xl px-4 py-2 cursor-pointer flex-shrink-0">
                  Editar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductoForm({ producto, onCancelar, onGuardado }: {
  producto: Producto;
  onCancelar: () => void;
  onGuardado: (p: Partial<Producto>) => void;
}) {
  const [dominio, setDominio] = useState(producto.dominio);
  const [urlRegistro, setUrlRegistro] = useState(producto.urlRegistro);
  const [tag, setTag] = useState(producto.tag);
  const [descripcion, setDescripcion] = useState(producto.descripcion ?? "");
  const [precioMensual, setPrecioMensual] = useState(producto.precioMensual);
  const [status, setStatus] = useState(producto.status);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function guardar() {
    const precio = parseFloat(precioMensual);
    if (!dominio.trim() || !urlRegistro.trim() || !tag.trim() || Number.isNaN(precio) || precio <= 0) {
      setError("Completá todos los campos con valores válidos.");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        await actualizarProductoAction(producto.id, { dominio, urlRegistro, tag, descripcion, precioMensual: precio, status });
        onGuardado({ dominio, urlRegistro, tag, descripcion, precioMensual: String(precio), status });
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar.");
      }
    });
  }

  const inputClass = "w-full border border-[#DCE0E5] rounded-lg px-3 py-2 text-[14px] text-[#0C2A45] outline-none focus:border-[#0E6BA8] focus:ring-2 focus:ring-[#0E6BA8]/10";
  const labelClass = "block text-[12px] font-semibold text-[#5B6577] mb-1";

  return (
    <div className="flex flex-col gap-3">
      <div className="font-bold text-[16px]">{producto.nombre}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Dominio</label>
          <input type="text" value={dominio} onChange={(e) => setDominio(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>URL de registro</label>
          <input type="text" value={urlRegistro} onChange={(e) => setUrlRegistro(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Etiqueta</label>
          <input type="text" value={tag} onChange={(e) => setTag(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Precio mensual (ARS)</label>
          <input type="number" min="0" step="1" value={precioMensual} onChange={(e) => setPrecioMensual(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Descripción</label>
        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} className={inputClass} />
      </div>
      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <input type="checkbox" checked={status === "activo"} onChange={(e) => setStatus(e.target.checked ? "activo" : "inactivo")} />
        <span className="text-[13px] font-medium text-[#5B6577]">Mostrar en la landing</span>
      </label>

      {error && (
        <div className="bg-[#FCE6E9] border border-[#E7A9B3] rounded-lg px-3 py-2 text-[12.5px] text-[#9B4A57] font-medium">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onCancelar} disabled={pending}
          className="font-semibold text-[14px] bg-white text-[#0C2A45] border border-[#DCE0E5] rounded-xl px-4 py-2.5 cursor-pointer">
          Cancelar
        </button>
        <button onClick={guardar} disabled={pending}
          className="font-semibold text-[14px] bg-[#0B6B47] text-white border-0 rounded-xl px-5 py-2.5 cursor-pointer disabled:opacity-60">
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
