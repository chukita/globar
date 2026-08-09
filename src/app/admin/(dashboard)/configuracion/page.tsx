import { getConfiguracion } from "@/lib/configuracion";
import { ConfiguracionForm } from "@/components/ConfiguracionForm";

// Lee la config en cada request — sin esto Next intenta prerenderearla en
// build time (sin DB disponible en el runner de CI) y el build falla.
export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const config = await getConfiguracion();

  return (
    <div className="p-10">
      <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Configuración</h1>
      <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">Reglas de negocio del programa de revendedores.</p>

      <div className="mt-6">
        <ConfiguracionForm
          comisionMonto={Number(config.comisionMonto)}
          comisionMeses={config.comisionMeses}
        />
      </div>
    </div>
  );
}
