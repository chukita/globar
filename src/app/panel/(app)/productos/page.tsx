import { auth } from "@/lib/auth";
import { db } from "@/db";
import { revendedores, productos, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { CopyButton } from "../perfil/CopyButton";
import { QrToggle } from "@/components/QrToggle";
import { getConfiguracion } from "@/lib/configuracion";
import { fmtARS } from "@/lib/constants";

export default async function ProductosPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, session.user.email)).limit(1);
  const [rev] = await db.select({ codigoVentas: revendedores.codigoVentas }).from(revendedores).where(eq(revendedores.userId, user.id)).limit(1);

  const lista = await db
    .select()
    .from(productos)
    .where(eq(productos.status, "activo"));

  const { comisionMonto, comisionMeses } = await getConfiguracion();
  const comisionTexto = `${fmtARS(Number(comisionMonto))} × ${comisionMeses} cuota${comisionMeses !== 1 ? "s" : ""}`;

  const codigo = rev?.codigoVentas ?? null;

  const items = await Promise.all(lista.map(async (p) => {
    const link = codigo ? `${p.urlRegistro}?vendedor=${codigo}` : p.urlRegistro;
    const qrSvg = codigo ? await QRCode.toString(link, { type: "svg", margin: 1, width: 160 }) : null;
    return { producto: p, link, qrSvg };
  }));

  return (
    <div className="p-10 max-w-[920px]">
      <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Mis productos</h1>
      <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-6">
        Compartí tu link de referido — o mostrale el código QR — para que tus clientes se registren. Las ventas se asocian automáticamente a tu cuenta.
      </p>

      {items.length === 0 ? (
        <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-10 text-center text-[#9AA3B2] text-[15px]">
          No hay productos disponibles aún.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {items.map(({ producto: p, link, qrSvg }) => (
            <ProductCard key={p.id} producto={p} link={link} tienecodigo={!!codigo} qrSvg={qrSvg} comisionTexto={comisionTexto} />
          ))}
        </div>
      )}

      <div className="mt-5 bg-[#F1F8FC] border border-[#C6DDEF] rounded-[14px] px-5 py-4 flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-[10px] bg-[#E1EFF8] flex-shrink-0 flex items-center justify-center font-extrabold text-[#0B5A8F] text-[15px]">i</div>
        <p className="text-[13.5px] text-[#3F6280] leading-relaxed m-0">
          Cuando un cliente se registra usando tu link, el parámetro <code className="bg-[#D8EBF8] px-1 rounded text-[12px]">vendedor</code> queda guardado en el sistema. Al pagar su primera cuota, la comisión se acredita automáticamente en tu cuenta.
        </p>
      </div>
    </div>
  );
}

function ProductCard({
  producto,
  link,
  tienecodigo,
  qrSvg,
  comisionTexto,
}: {
  producto: typeof import("@/db/schema").productos.$inferSelect;
  link: string;
  tienecodigo: boolean;
  qrSvg: string | null;
  comisionTexto: string;
}) {
  const inicial = producto.nombre[0].toLowerCase();
  const colors: Record<string, { bg: string; text: string; glow: string }> = {
    a: { bg: "#E1EFF8", text: "#0B5A8F", glow: "rgba(14,107,168,.08)" },
    n: { bg: "#F0E8F8", text: "#7B4FA6", glow: "rgba(123,79,166,.08)" },
  };
  const c = colors[inicial] ?? { bg: "#E9ECEF", text: "#5B6577", glow: "rgba(0,0,0,.04)" };

  return (
    <div className="bg-white border border-[#E9ECEF] rounded-[22px] p-7 relative overflow-hidden flex flex-col">
      <div className="absolute -top-10 -right-8 w-[160px] h-[160px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle,${c.glow},transparent 70%)` }} />
      <div className="relative flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-[13px] flex items-center justify-center font-extrabold text-[20px] flex-shrink-0"
            style={{ background: c.bg, color: c.text }}>
            {inicial}
          </div>
          <span className="text-[11.5px] font-bold text-[#1B9462] bg-[#E7F5EE] border border-[#9BD3B6] rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <span className="w-[6px] h-[6px] rounded-full bg-[#1B9462]" />
            Disponible
          </span>
        </div>

        <h2 className="font-extrabold text-[21px] mb-0.5" style={{ letterSpacing: "-0.02em" }}>{producto.nombre}</h2>
        <div className="text-[12.5px] text-[#9AA3B2] mb-3">{producto.dominio}</div>
        <p className="text-[14px] text-[#5B6577] leading-[1.55] mb-4 flex-1">{producto.descripcion}</p>

        {/* Comisión */}
        <div className="bg-[#F7F8FA] border border-[#E9ECEF] rounded-xl px-4 py-3.5 mb-4">
          <div className="text-[11.5px] text-[#9AA3B2] font-semibold mb-0.5">Comisión por venta</div>
          <div className="text-[13.5px] text-[#0C2A45] font-semibold">
            {comisionTexto}
          </div>
        </div>

        {/* Link */}
        {tienecodigo ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-[#F7F8FA] border border-[#E9ECEF] rounded-xl px-3 py-2.5">
              <span className="text-[12.5px] text-[#0C2A45] font-medium overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                {link}
              </span>
            </div>
            <div className="flex gap-2">
              <CopyButton
                text={link}
                label="Copiar link"
                labelDone="¡Copiado!"
                className="flex-1 font-semibold text-[13.5px] bg-[#0E6BA8] text-white border-0 rounded-xl py-2.5 cursor-pointer"
              />
              <a href={link} target="_blank" rel="noreferrer"
                className="font-semibold text-[13.5px] bg-white text-[#0C2A45] border border-[#DCE0E5] rounded-xl px-4 py-2.5 whitespace-nowrap no-underline">
                Abrir
              </a>
            </div>
            {qrSvg && <QrToggle svg={qrSvg} />}
          </div>
        ) : (
          <div className="bg-[#FFF8E6] border border-[#F0D080] rounded-xl px-4 py-3 text-[13px] text-[#7A6020]">
            Necesitás un código de ventas para generar tu link.{" "}
            <Link href="/panel/perfil" className="font-semibold underline">Ver perfil</Link>
          </div>
        )}
      </div>
    </div>
  );
}
