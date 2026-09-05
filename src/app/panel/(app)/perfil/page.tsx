import { auth } from "@/lib/auth";
import { db } from "@/db";
import { revendedores, productos, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CopyButton } from "./CopyButton";
import { DatosPersonalesForm } from "./DatosPersonalesForm";
import { DatosCobroForm } from "./DatosCobroForm";
import { NotificacionesForm } from "./NotificacionesForm";
import { EliminarCuentaForm } from "./EliminarCuentaForm";
import { getConfiguracion } from "@/lib/configuracion";
import { fmtARS } from "@/lib/constants";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const [user] = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
  const [rev] = await db.select().from(revendedores).where(eq(revendedores.userId, user.id)).limit(1);

  const productosActivos = await db
    .select({ id: productos.id, nombre: productos.nombre, dominio: productos.dominio, urlRegistro: productos.urlRegistro })
    .from(productos)
    .where(eq(productos.status, "activo"));

  const { comisionMonto, comisionMeses } = await getConfiguracion();

  const codigo = rev?.codigoVentas ?? null;

  return (
    <div className="p-10 max-w-[980px]">
      <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>
        Perfil
      </h1>
      <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">
        Gestioná tus datos y compartí tu link de referido para registrar nuevas ventas.
      </p>

      {/* Profile data */}
      <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-7 mt-6">
        <div className="font-semibold text-[18px] mb-5">Datos personales</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 mb-5">
          <DataRow label="Nombre" value={user.name ?? "—"} />
          <DataRow label="Email" value={user.email} />
          <DataRow label="País" value={rev?.pais ?? "Argentina"} />
          <DataRow label="Estado de cuenta" value={rev ? (rev.activo ? "Activa" : "Inactiva") : "Sin perfil"}
            valueColor={rev?.activo ? "#0B5A8F" : "#9B4A57"} />
        </div>
        <DatosPersonalesForm
          dni={rev?.dni ?? ""}
          fechaNacimiento={rev?.fechaNacimiento ?? ""}
          provincia={rev?.provincia ?? ""}
          localidad={rev?.localidad ?? ""}
          telefono={rev?.telefono ?? ""}
        />
      </div>

      {/* Datos de cobro */}
      <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-7 mt-5">
        <div className="font-semibold text-[18px] mb-1">Datos de cobro</div>
        <p className="text-[13.5px] text-[#5B6577] mb-5">
          CBU o alias de Mercado Pago, y a nombre de quién está la cuenta, para acreditarte las comisiones.
        </p>
        <DatosCobroForm
          currentCbuAlias={rev?.cbuAlias ?? ""}
          currentTitularNombre={rev?.titularNombre ?? ""}
          currentTitularCuit={rev?.titularCuit ?? ""}
          currentPuedeFacturar={rev?.puedeFacturar ?? false}
        />
      </div>

      {/* Referral links */}
      <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-7 mt-5">
        <div className="text-[13px] text-[#9AA3B2] font-semibold uppercase tracking-[.05em] mb-2">
          Links de referido
        </div>
        <p className="text-[13.5px] text-[#5B6577] leading-snug mb-4">
          Compartí este link con tus contactos. Cuando alguien se registre desde tu link, la venta queda asociada a tu cuenta y empezás a cobrar comisión a partir del primer pago del cliente.
        </p>
        {productosActivos.length === 0 ? (
          <p className="text-[14px] text-[#9AA3B2]">No hay productos disponibles aún.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {productosActivos.map((p) => {
              const link = `${p.urlRegistro}?vendedor=${codigo}`;
              return (
                <div key={p.id}>
                  <div className="text-[12.5px] font-semibold text-[#5B6577] mb-1.5">{p.nombre}</div>
                  <div className="flex items-center gap-2 bg-[#F7F8FA] border border-[#E9ECEF] rounded-xl px-3 py-2.5 mb-2">
                    <span className="text-[13px] text-[#0C2A45] font-medium overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                      {link}
                    </span>
                  </div>
                  <CopyButton text={link} label="Copiar link" labelDone="¡Copiado!"
                    className="font-semibold text-[13.5px] bg-[#0C2A45] text-white border-0 rounded-xl py-2.5 w-full cursor-pointer" />
                </div>
              );
            })}
          </div>
        )}
        {codigo && (
          <a href="/api/panel/tarjeta-pdf" target="_blank" rel="noreferrer"
            className="mt-4 font-semibold text-[13.5px] text-[#0C2A45] border border-[#DCE0E5] rounded-xl py-2.5 w-full text-center block no-underline hover:border-[#0E6BA8] transition-colors">
            Descargar tarjetas para imprimir
          </a>
        )}
        <p className="text-[12px] text-[#9AA3B2] leading-relaxed mt-4 mb-0">
          Cada venta genera {comisionMeses} cuotas de comisión de {fmtARS(Number(comisionMonto))} cada una. Se acreditan mes a mes mientras el cliente mantenga la suscripción.
        </p>
      </div>

      {/* Notificaciones */}
      <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-7 mt-5">
        <div className="font-semibold text-[18px] mb-1">Notificaciones</div>
        <p className="text-[13.5px] text-[#5B6577] mb-5">
          Elegí qué avisos por email querés recibir.
        </p>
        <NotificacionesForm
          notifFacturaPagada={rev?.notifFacturaPagada ?? true}
          notifComisionGenerada={rev?.notifComisionGenerada ?? true}
        />
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-[#E7A9B3] rounded-[20px] p-7 mt-5">
        <div className="font-semibold text-[18px] mb-1">Eliminar cuenta</div>
        <p className="text-[13.5px] text-[#5B6577] mb-5">
          Borra tu cuenta de revendedor junto con tus ventas, cuotas y facturas. No vas a poder cobrar comisiones ya generadas pero no cobradas, ni las de suscripciones futuras de tus clientes. Esta acción no se puede deshacer.
        </p>
        <EliminarCuentaForm codigoVentas={rev?.codigoVentas ?? ""} />
      </div>
    </div>
  );
}

function DataRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="border-b border-[#EEF0F2] pb-4">
      <div className="text-[12.5px] text-[#9AA3B2]">{label}</div>
      <div className="text-[15px] font-semibold mt-1" style={{ color: valueColor ?? "#0C2A45" }}>{value}</div>
    </div>
  );
}
