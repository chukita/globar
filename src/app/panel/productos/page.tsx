import { auth } from "@/lib/auth";
import { ensureRevendedor } from "@/lib/revendedor";
import { getProductosConHabilitacion } from "@/lib/panel-data";
import { getConfiguracion } from "@/lib/configuracion";
import { fmtARS } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProductosPage() {
  const session = await auth();
  const revendedor = await ensureRevendedor(session!.user!.id!);
  const [productos, config] = await Promise.all([
    getProductosConHabilitacion(revendedor.id),
    getConfiguracion(),
  ]);

  const comisionTotal = Number(config.comisionMonto) * config.comisionMeses;

  return (
    <div className="p-10 max-w-[920px]">
      <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Mis productos</h1>
      <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">
        Solo podés ofrecer los productos para los que el equipo de glob.ar te dio de alta.
      </p>

      <div className="grid grid-cols-2 gap-5 mt-6">
        {productos.map((p) => (
          <div key={p.id}
            className="bg-white rounded-[22px] p-7 relative overflow-hidden"
            style={{ border: p.habilitado ? "2px solid #9BD3B6" : "1px solid #E9ECEF" }}
          >
            <div className="relative">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-[13px] bg-[#E1EFF8] flex items-center justify-center font-extrabold text-[20px] text-[#0B5A8F]">
                  {p.nombre[0]}
                </div>
                <span className="text-xs font-bold rounded-full px-3 py-1.5 flex items-center gap-1.5"
                  style={{
                    background: p.habilitado ? "#E7F5EE" : "#F7F8FA",
                    color: p.habilitado ? "#0B6B47" : "#9AA3B2",
                    border: p.habilitado ? "none" : "1px solid #E9ECEF",
                  }}>
                  <span className="w-[7px] h-[7px] rounded-full" style={{ background: p.habilitado ? "#1B9462" : "#C8D0D8" }} />
                  {p.habilitado ? "Habilitado" : "No habilitado"}
                </span>
              </div>
              <h2 className="font-extrabold text-[22px] mt-4 mb-0.5" style={{ letterSpacing: "-0.02em" }}>{p.nombre}</h2>
              <div className="text-[13px] text-[#9AA3B2]">{p.dominio}</div>
              <p className="text-[14.5px] text-[#5B6577] leading-[1.55] mt-3 mb-0">{p.descripcion}</p>

              {p.habilitado ? (
                <>
                  <div className="mt-4 bg-[#F1F8F4] border border-[#C6E8D4] rounded-xl px-4 py-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-[11.5px] text-[#5B8A6A] font-semibold">Comisión por venta</div>
                      <div className="font-extrabold text-[22px] text-[#0B6B47]">{fmtARS(comisionTotal)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11.5px] text-[#5B8A6A] font-semibold">Por mes × {config.comisionMeses}</div>
                      <div className="font-bold text-base text-[#1B9462]">{fmtARS(Number(config.comisionMonto))}</div>
                    </div>
                  </div>
                  <div className="flex gap-2.5 mt-4">
                    <Link href="/panel/perfil"
                      className="flex-1 font-semibold text-sm bg-[#0E6BA8] text-white rounded-xl py-3 text-center">
                      Ver mi código
                    </Link>
                    <Link href="/panel/comisiones"
                      className="flex-1 font-semibold text-sm bg-white text-[#0C2A45] border border-[#DCE0E5] rounded-xl py-[11px] text-center">
                      Ver comisiones
                    </Link>
                  </div>
                </>
              ) : (
                <div className="mt-4 bg-[#F0F2F5] border border-dashed border-[#C8D0D8] rounded-xl p-4">
                  <div className="text-[13px] font-bold text-[#6B7280]">Todavía no estás habilitado</div>
                  <div className="text-[12.5px] text-[#9AA3B2] mt-0.5">
                    Escribile al equipo de glob.ar para que te den de alta en este producto.
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {productos.length === 0 && (
        <div className="mt-6 bg-white border border-[#E9ECEF] rounded-[18px] px-6 py-10 text-center text-[14px] text-[#9AA3B2]">
          No hay productos disponibles todavía.
        </div>
      )}
    </div>
  );
}
