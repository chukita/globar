import { getTodasLasFacturas } from "@/lib/admin-data";
import { FacturasAdminClient } from "@/components/FacturasAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminFacturasPage() {
  const facturas = await getTodasLasFacturas();
  return <FacturasAdminClient facturasIniciales={facturas} />;
}
