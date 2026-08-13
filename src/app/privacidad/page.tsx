import Link from "next/link";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";

/**
 * Cumple los puntos básicos exigidos por la Ley 25.326 de Protección de
 * Datos Personales (informar finalidad, derechos ARCO, responsable,
 * transferencias a terceros).
 */
export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0C2A45]">
      <PublicNav />
      <div className="max-w-[760px] mx-auto px-4 sm:px-8 py-14">
        <h1 className="font-extrabold text-[26px] sm:text-[34px] m-0" style={{ letterSpacing: "-0.03em" }}>
          Política de Privacidad
        </h1>
        <p className="text-[13.5px] text-[#9AA3B2] mt-2 mb-10">
          Última actualización: 12 de agosto de 2026
        </p>

        <article className="space-y-7 text-[14.5px] leading-relaxed text-[#3F4A5A]">
          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">1. Responsable del tratamiento</h2>
            <p>
              El responsable del tratamiento de tus datos personales es{" "}
              <strong>Carlos Hugo Costantino</strong>, monotributista, CUIT 20-29739072-5,
              con domicilio en Berta Vidal de Battini 1343, San Luis, Provincia de San Luis,
              República Argentina. Contacto:{" "}
              <a href="mailto:legal@glob.ar" className="text-[#0E6BA8] font-medium">legal@glob.ar</a>.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">2. Qué datos recolectamos</h2>
            <p className="mb-2">Recolectamos dos tipos de datos:</p>
            <p className="font-semibold text-[#0C2A45] mt-3 mb-1">a) Datos del revendedor:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nombre y email.</li>
              <li>Contraseña (almacenada cifrada), o los datos que Google nos comparte si elegís iniciar sesión con esa opción.</li>
              <li>DNI, fecha de nacimiento, provincia, localidad y, opcionalmente, teléfono.</li>
              <li>CBU o alias de Mercado Pago, nombre del titular de la cuenta y, si podés emitir factura, tu CUIT/CUIL — para poder pagarte las comisiones.</li>
            </ul>
            <p className="font-semibold text-[#0C2A45] mt-4 mb-1">b) Datos de los clientes que se registran con tu link:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Cuando alguien se registra en agendaonline o nume usando tu link de
                referido y paga, ese producto le informa a glob.ar el nombre y el email de
                esa persona junto con el pago — únicamente para vincular la venta a tu
                comisión. glob.ar no recibe ni almacena datos de pago de esos clientes
                (tarjetas, CBU, etc.), eso lo procesa cada producto directamente.
              </li>
            </ul>
            <p className="mt-3">
              También recolectamos datos técnicos automáticos (dirección IP, tipo de
              navegador, fecha y hora de las solicitudes) para seguridad y prevención de
              abuso.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">3. Para qué los usamos</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Generar tu código de ventas y tus links de referido por producto.</li>
              <li>Registrar las ventas asociadas a tu código y calcular tus comisiones.</li>
              <li>Pagarte las comisiones por transferencia bancaria.</li>
              <li>Mostrarte el estado de tus comisiones, clientes y facturas en el panel.</li>
              <li>Brindar soporte cuando lo solicitás.</li>
            </ul>
            <p className="mt-3">
              <strong>No vendemos tus datos a terceros</strong> ni los usamos con fines
              publicitarios.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">4. Terceros que procesan datos por nosotros</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Google</strong> — login opcional con cuenta Google.</li>
              <li>
                <strong>agendaonline y nume</strong> — cada producto es responsable del
                tratamiento de los datos de sus propios clientes; nos informan solo lo
                necesario (nombre, email, monto y fecha del pago) para calcular tu comisión.
              </li>
              <li>Proveedores de hosting e infraestructura para operar la plataforma.</li>
            </ul>
            <p className="mt-3">
              No compartimos tus datos con terceros más allá de estos proveedores técnicos
              esenciales. glob.ar no procesa pagos directamente — tus comisiones se pagan
              por transferencia bancaria manual, no a través de una pasarela de pago propia.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">5. Cuánto tiempo los guardamos</h2>
            <p>
              Mientras tu cuenta de revendedor esté activa, y por un plazo razonable después
              de la baja para cumplir obligaciones legales y contables (por ejemplo,
              comisiones ya generadas). Podés pedir la eliminación anticipada de tus datos
              escribiendo a{" "}
              <a href="mailto:legal@glob.ar" className="text-[#0E6BA8] font-medium">legal@glob.ar</a>.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">6. Tus derechos (Ley 25.326)</h2>
            <p>Conforme a la Ley 25.326 de Protección de Datos Personales, tenés derecho a:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Acceder</strong> a tus datos personales que tenemos.</li>
              <li><strong>Rectificar</strong> datos inexactos o desactualizados (podés hacerlo vos mismo desde tu perfil).</li>
              <li><strong>Suprimir</strong> tus datos cuando ya no sean necesarios.</li>
              <li><strong>Oponerte</strong> a tratamientos específicos.</li>
            </ul>
            <p className="mt-3">
              Para ejercerlos escribinos a{" "}
              <a href="mailto:legal@glob.ar" className="text-[#0E6BA8] font-medium">legal@glob.ar</a>.
              El primer pedido en un período de 6 meses es gratuito (art. 14 Ley 25.326).
            </p>
            <p className="mt-3">
              La Agencia de Acceso a la Información Pública (AAIP), órgano de control de la
              Ley 25.326, atiende denuncias y reclamos vinculados al tratamiento indebido de
              datos personales:{" "}
              <a href="https://www.argentina.gob.ar/aaip/datospersonales" target="_blank" rel="noopener noreferrer" className="text-[#0E6BA8] font-medium">
                argentina.gob.ar/aaip/datospersonales
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">7. Seguridad</h2>
            <p>
              Aplicamos medidas técnicas y organizativas razonables: cifrado HTTPS en todas
              las comunicaciones, contraseñas almacenadas con hash, accesos restringidos por
              rol. Ningún sistema es 100% seguro; ante un incidente material te
              notificaremos por email a la brevedad razonable.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">8. Cookies y almacenamiento local</h2>
            <p>
              Usamos únicamente una cookie de sesión (para mantenerte logueado en el panel)
              y, si elegís esa opción, las cookies necesarias para el login con Google. No
              usamos cookies de seguimiento ni de publicidad.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">9. Cambios a esta Política</h2>
            <p>
              Podemos modificar esta Política para adecuarla a cambios legales o del
              programa. Los cambios se anuncian con razonable anticipación en esta página y,
              si son sustanciales, también por email.
            </p>
          </section>

          <section>
            <p className="text-[13px] text-[#9AA3B2]">
              Para más información, consultá también los{" "}
              <Link href="/terminos" className="text-[#0E6BA8] font-medium">Términos y Condiciones</Link>.
            </p>
          </section>
        </article>
      </div>
      <Footer />
    </div>
  );
}
