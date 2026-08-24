import { auth } from "@/lib/auth";
import { db } from "@/db";
import { productos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CapacitacionClient } from "./CapacitacionClient";
import { getRevendedorByUserId } from "@/lib/revendedor";
import { getProductosConHabilitacion } from "@/lib/panel-data";
import { getQuizPublico, PRODUCTOS_CON_EVALUACION } from "@/lib/capacitacionQuiz";
import { getConfiguracion } from "@/lib/configuracion";

type Material = { tipo: "video" | "pdf" | "link"; titulo: string; duracion?: string; url: string };

// Materiales por producto — se administran acá hasta tener tabla en admin
const MATERIALES: Record<string, Material[]> = {
  agendaonline: [
    { tipo: "video", titulo: "Introducción a agendaonline", duracion: "4:09 min", url: "/capacitacion/agendaonline-intro.mp4" },
    { tipo: "pdf",   titulo: "Guía de ventas · agendaonline", url: "#" },
    { tipo: "link",  titulo: "Demo del producto", url: "https://agendaonline.com.ar" },
  ],
  nume: [
    { tipo: "video", titulo: "Conocé NuMe en 5 minutos", duracion: "5:10 min", url: "#" },
    { tipo: "pdf",   titulo: "Argumentario de ventas · NuMe", url: "#" },
    { tipo: "link",  titulo: "Demo del producto", url: "https://nume.com.ar" },
  ],
};

export default async function CapacitacionPage() {
  const session = await auth();

  const lista = await db
    .select({ id: productos.id, nombre: productos.nombre, descripcion: productos.descripcion, dominio: productos.dominio })
    .from(productos)
    .where(eq(productos.status, "activo"));

  const { comisionMeses } = await getConfiguracion();

  let habilitadosSet = new Set<string>();
  if (session?.user?.id) {
    const rev = await getRevendedorByUserId(session.user.id);
    if (rev) {
      const conHabilitacion = await getProductosConHabilitacion(rev.id);
      habilitadosSet = new Set(conHabilitacion.filter(p => p.habilitado).map(p => p.id));
    }
  }

  const productosConMateriales = lista.map(p => ({
    id:               p.id,
    nombre:           p.nombre,
    descripcion:      p.descripcion ?? "",
    dominio:          p.dominio,
    materiales:       MATERIALES[p.nombre] ?? [],
    habilitado:       habilitadosSet.has(p.id),
    requiereEvaluacion: PRODUCTOS_CON_EVALUACION.has(p.nombre),
    quiz:             getQuizPublico(p.nombre, comisionMeses),
  }));

  return (
    <div className="p-10 max-w-[860px]">
      <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Capacitación</h1>
      <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">
        Materiales para conocer cada producto y venderlos mejor. Para agendaonline, mirar el video y aprobar la evaluación activa el producto en tu cuenta.
      </p>
      <CapacitacionClient productos={productosConMateriales} />
    </div>
  );
}
