import { db } from "@/db";
import { revendedores, productos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { fmtARS } from "@/lib/constants";
import { AgendaIllustration, NumeIllustration } from "@/components/ProductIllustrations";
import { getProductosConHabilitacion } from "@/lib/panel-data";
import { PRODUCTOS_CON_EVALUACION } from "@/lib/capacitacionQuiz";

const PRODUCT_COLORS: Record<string, { bg: string; text: string; tag: string }> = {
  agendaonline: { bg: "#E1EFF8", text: "#0B5A8F", tag: "Turnos & reservas" },
  nume:         { bg: "#F0E8F8", text: "#7B4FA6", tag: "Carta digital & menú QR" },
};
const DEFAULT_COLOR = { bg: "#E9ECEF", text: "#5B6577", tag: "Producto digital" };

export const dynamic = "force-dynamic";

/**
 * Landing pública general de un revendedor: un solo link/QR (en vez de uno
 * por producto) que muestra todos los productos activos, cada uno con el
 * código del revendedor ya puesto. Si el código no existe o el revendedor
 * está inactivo, la página se muestra igual (nunca rota) pero sin agregar
 * `?vendedor=` a los links — mismo criterio "fail open" que ya usan los
 * webhooks de agendaonline/nume ante un código inválido.
 */
export default async function LandingPorVendedorPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;

  const [rev] = await db.select({ id: revendedores.id, activo: revendedores.activo }).from(revendedores).where(eq(revendedores.codigoVentas, codigo)).limit(1);
  const codigoValido = !!rev?.activo;

  // Productos que exigen aprobar la capacitación (video+quiz) antes de
  // poder venderse — mientras el revendedor no la aprobó, no tiene sentido
  // mostrárselo al cliente final en su propia landing. Con código
  // inválido/inactivo tampoco hay un revendedor habilitado detrás, así que
  // se ocultan igual (el resto de productos sigue mostrándose, "fail open").
  const habilitadosSet = rev
    ? new Set((await getProductosConHabilitacion(rev.id)).filter(p => p.habilitado).map(p => p.id))
    : new Set<string>();

  const listaCompleta = await db
    .select({ id: productos.id, nombre: productos.nombre, dominio: productos.dominio, urlRegistro: productos.urlRegistro, descripcion: productos.descripcion, precioMensual: productos.precioMensual })
    .from(productos)
    .where(eq(productos.status, "activo"));

  const lista = listaCompleta.filter(p => !PRODUCTOS_CON_EVALUACION.has(p.nombre) || habilitadosSet.has(p.id));

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0C2A45]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <svg key={i} style={{ position: "absolute", left: 0, width: "100%", top: i * 160, opacity: 0.5 }}
            viewBox="0 0 1440 160" preserveAspectRatio="none" height="160">
            <path d="M0,60 C200,100 400,20 600,60 C800,100 1000,30 1200,60 C1350,82 1400,70 1440,65" stroke="#b0b8cc" strokeWidth="1.5" fill="none"/>
            <path d="M0,90 C180,120 380,50 600,90 C820,130 1020,55 1240,90 C1360,108 1410,95 1440,92" stroke="#b0b8cc" strokeWidth="1" fill="none"/>
            <path d="M0,120 C220,148 440,80 660,120 C880,160 1080,88 1300,120 C1380,135 1420,128 1440,124" stroke="#b0b8cc" strokeWidth="0.8" fill="none"/>
          </svg>
        ))}
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <PublicNav />

        <div className="max-w-[1180px] mx-auto px-4 sm:px-8 pt-14 pb-8 text-center">
          <div className="inline-flex items-center gap-2 font-semibold text-[13px] uppercase tracking-[.12em] text-[#0E6BA8]">
            <span className="w-[7px] h-[7px] rounded-full bg-[#E7A9B3]" />
            Productos digitales
          </div>
          <h1 className="font-extrabold text-[30px] sm:text-[40px] mt-2.5 mb-0" style={{ letterSpacing: "-0.025em" }}>
            Elegí qué producto querés conocer
          </h1>
          <p className="text-[15px] text-[#5B6577] max-w-[520px] mx-auto mt-3.5 mb-0 leading-relaxed">
            Herramientas digitales para tu negocio, listas para usar hoy.
          </p>
        </div>

        <div className="max-w-[1180px] mx-auto px-4 sm:px-8 pb-[56px] sm:pb-[84px]">
          {lista.length === 0 ? (
            <p className="text-[#9AA3B2] text-center">Próximamente.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {lista.map((p) => {
                const c = PRODUCT_COLORS[p.nombre] ?? DEFAULT_COLOR;
                const precio = parseFloat(String(p.precioMensual));
                const link = codigoValido ? `${p.urlRegistro}?vendedor=${codigo}` : p.urlRegistro;
                return (
                  <div key={p.id} className="bg-white border border-[#E9ECEF] rounded-[22px] p-[30px]">
                    <div className="aspect-[560/180] rounded-[14px] overflow-hidden">
                      {p.nombre === "nume" ? <NumeIllustration /> : <AgendaIllustration />}
                    </div>
                    <div className="flex items-center justify-between mt-5">
                      <span className="font-bold text-2xl" style={{ letterSpacing: "-0.02em" }}>{p.nombre}</span>
                      <span className="text-xs font-semibold rounded-full px-3 py-1.5"
                        style={{ background: c.bg, color: c.text }}>{c.tag}</span>
                    </div>
                    <div className="text-[13px] text-[#9AA3B2] mt-0.5">{p.dominio}</div>
                    <p className="text-[15px] text-[#5B6577] leading-[1.55] mt-3.5 mb-5">{p.descripcion}</p>
                    <div className="border-t border-[#EEF0F2] pt-4">
                      <div className="text-xs text-[#9AA3B2]">Suscripción</div>
                      <div className="font-bold text-2xl">Desde {fmtARS(precio)}<span className="text-[13px] text-[#9AA3B2] font-medium">/mes</span></div>
                    </div>
                    <a href={link} target="_blank" rel="noopener noreferrer"
                      className="mt-4 flex items-center justify-center gap-1.5 bg-[#0E6BA8] text-white rounded-xl py-3 text-[14px] font-semibold no-underline">
                      Ver {p.nombre}
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
