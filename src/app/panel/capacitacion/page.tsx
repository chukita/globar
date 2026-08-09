import { getConfiguracion } from "@/lib/configuracion";
import { CapacitacionClient } from "@/components/CapacitacionClient";

export const dynamic = "force-dynamic";

export default async function CapacitacionPage() {
  const config = await getConfiguracion();

  return (
    <CapacitacionClient
      comisionMonto={Number(config.comisionMonto)}
      comisionMeses={config.comisionMeses}
    />
  );
}
