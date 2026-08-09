import { auth } from "@/lib/auth";
import { ensureRevendedor } from "@/lib/revendedor";
import { getCuotasFacturables, getFacturasDelRevendedor } from "@/lib/panel-data";
import { getConfiguracion } from "@/lib/configuracion";
import { FacturasClient } from "@/components/FacturasClient";

export const dynamic = "force-dynamic";

export default async function FacturasRevendedorPage() {
  const session = await auth();
  const revendedor = await ensureRevendedor(session!.user!.id!);
  const [cuotas, facturas, config] = await Promise.all([
    getCuotasFacturables(revendedor.id),
    getFacturasDelRevendedor(revendedor.id),
    getConfiguracion(),
  ]);

  return (
    <FacturasClient
      cuotasIniciales={cuotas}
      facturasIniciales={facturas}
      comisionMeses={config.comisionMeses}
    />
  );
}
