import { getContactos } from "@/lib/admin-data";
import { ContactoAdminClient } from "@/components/ContactoAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminContactoPage() {
  const contactos = await getContactos();
  return <ContactoAdminClient contactosIniciales={contactos} />;
}
