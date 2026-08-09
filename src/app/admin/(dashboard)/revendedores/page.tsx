import { getTodosLosRevendedores } from "@/lib/admin-data";
import { RevendedoresAdminClient } from "@/components/RevendedoresAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminRevendedoresPage() {
  const revendedores = await getTodosLosRevendedores();
  return <RevendedoresAdminClient revendedoresIniciales={revendedores} />;
}
