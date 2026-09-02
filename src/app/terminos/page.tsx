import Link from "next/link";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";

/**
 * Draft escrito sin asistencia legal — cubre los puntos básicos de la
 * práctica común en programas de afiliados/referidos argentinos, pero
 * conviene que un abogado lo revise antes de escalar el programa.
 */
export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0C2A45]">
      <PublicNav />
      <div className="max-w-[760px] mx-auto px-4 sm:px-8 py-14">
        <h1 className="font-extrabold text-[26px] sm:text-[34px] m-0" style={{ letterSpacing: "-0.03em" }}>
          Términos y Condiciones
        </h1>
        <p className="text-[13.5px] text-[#9AA3B2] mt-2 mb-10">
          Última actualización: 12 de agosto de 2026
        </p>

        <article className="space-y-7 text-[14.5px] leading-relaxed text-[#3F4A5A]">
          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">1. Identidad del proveedor</h2>
            <p>
              glob.ar es operado por <strong>Grupo Globaliza</strong>,
              CUIT 20-29739072-5, con domicilio en Berta Vidal de Battini 1343, San Luis,
              Provincia de San Luis, República Argentina. Contacto:{" "}
              <a href="mailto:hola@glob.ar" className="text-[#0E6BA8] font-medium">hola@glob.ar</a>.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">2. Aceptación</h2>
            <p>
              Al registrarte como revendedor en glob.ar aceptás estos Términos y Condiciones y la{" "}
              <Link href="/privacidad" className="text-[#0E6BA8] font-medium">Política de Privacidad</Link>.
              Si no estás de acuerdo, no debés registrarte ni utilizar el programa.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">3. Qué es glob.ar</h2>
            <p>
              glob.ar es una plataforma de reventa de productos digitales SaaS propios
              (actualmente agendaonline.com.ar y nume.com.ar). Le da a cada revendedor un
              código de ventas único y un link de referido por producto para compartir con
              sus contactos; cuando alguien se registra en el producto usando ese link y paga
              su suscripción, glob.ar le genera una comisión al revendedor.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">4. Naturaleza de la relación y autonomía</h2>
            <p>
              La relación entre glob.ar y el revendedor es exclusivamente comercial. El
              revendedor actúa con plena autonomía técnica, metodológica y organizativa:
              elige sus propias estrategias de promoción, sus redes de contacto y su cartera
              de clientes sin recibir directivas obligatorias de glob.ar. No existe entre las
              partes ningún vínculo de subordinación ni relación de dependencia laboral en
              los términos de la Ley N° 20.744. El revendedor no está sujeto a horarios,
              jornadas mínimas ni objetivos obligatorios de venta, y glob.ar no puede
              aplicarle sanciones disciplinarias de ningún tipo.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">5. Herramientas y gastos operativos</h2>
            <p>
              El revendedor desarrolla su actividad utilizando sus propios medios e
              infraestructura (dispositivos, conectividad, movilidad, etc.). Todos los
              gastos operativos, impositivos, previsionales y de traslado en los que incurra
              para promover los productos corren por su exclusiva cuenta; no tiene derecho a
              reclamar reintegro alguno a glob.ar por esos conceptos.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">6. Cómo funciona el programa</h2>
            <p>
              El monto por cuota, la cantidad de cuotas y el resto de las condiciones de la
              comisión son configurables y pueden cambiar en el tiempo — las cuotas ya
              generadas antes de un cambio no se recalculan. La comisión se genera cuando el
              producto le informa a glob.ar que el cliente referido pagó, y queda disponible
              para que el revendedor la facture apenas se genera. No hay ningún costo ni
              suscripción que el revendedor deba pagarle a glob.ar para participar.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">7. Registro y cuenta</h2>
            <p>
              Para participar del programa hay que registrarse brindando información veraz
              (nombre, email, DNI, fecha de nacimiento, provincia, localidad y,
              opcionalmente, teléfono) y mantenerla actualizada desde el panel. El
              revendedor es responsable de la confidencialidad de sus credenciales de acceso
              y de toda actividad realizada con su cuenta, y debe ser mayor de edad y
              residente en Argentina.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">8. Pago de comisiones</h2>
            <p>
              Las comisiones se pagan por transferencia bancaria al CBU o alias que el
              revendedor cargue en su perfil, a nombre de quien indique como titular de la
              cuenta. Para cobrar, el revendedor debe estar inscrito ante la AFIP (Monotributo
              u otro régimen) y cargar su CUIT/CUIL en el perfil. La factura electrónica
              correspondiente debe presentarse dentro de los primeros 5 días hábiles de cada
              mes por las cuotas generadas el mes anterior. glob.ar marca cada cuota como
              pagada una vez que el revendedor sube su factura y el pago se realiza. Como no
              hay ningún cobro previo del revendedor hacia glob.ar, no corresponde un derecho
              de arrepentimiento sobre la comisión: es un ingreso a favor del revendedor, no
              un cargo que se le haga.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">9. Baja de la cuenta</h2>
            <p>
              El revendedor puede pedir la baja de su cuenta en cualquier momento
              escribiendo a{" "}
              <a href="mailto:legal@glob.ar" className="text-[#0E6BA8] font-medium">legal@glob.ar</a>.
              Las comisiones ya generadas y no pagadas al momento de la baja se liquidan
              igual, salvo que correspondan a una venta anulada por derecho de
              arrepentimiento del cliente final del lado del producto.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">10. Obligaciones del revendedor</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Usar el código y el link de referido de buena fe, sin fines fraudulentos.</li>
              <li>No hacerse pasar por glob.ar, agendaonline o nume, ni prometer condiciones que no existen.</li>
              <li>Mantener actualizados sus datos personales y de cobro.</li>
              <li>No compartir su código de ventas de forma que induzca a error sobre su origen.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">11. Disponibilidad y limitación de responsabilidad</h2>
            <p>
              El programa se presta &quot;tal cual&quot;, sin garantía de disponibilidad
              ininterrumpida. glob.ar no es responsable por interrupciones derivadas de
              proveedores de infraestructura, tareas de mantenimiento o causas de fuerza
              mayor, ni por cambios que agendaonline o nume hagan en sus propios productos.
              La responsabilidad máxima de glob.ar frente a un revendedor se limita al monto
              de comisiones generadas y no pagadas a su favor.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">12. Propiedad intelectual</h2>
            <p>
              Todos los derechos sobre el software, marca y diseño de glob.ar pertenecen a
              su proveedor. El revendedor no adquiere ningún derecho sobre las marcas de
              glob.ar ni de los productos que revende, más allá del uso del código y link de
              referido para el fin del programa.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">13. Modificaciones</h2>
            <p>
              glob.ar podrá modificar estos Términos comunicando los cambios por email o
              mediante aviso en el panel. Si el revendedor continúa usando el programa luego
              de la modificación, se entenderá que la acepta.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">14. Ley aplicable y jurisdicción</h2>
            <p>
              Estos Términos se rigen por las leyes de la República Argentina. Para cualquier
              controversia, las partes se someten a la jurisdicción de los tribunales
              ordinarios competentes.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#0C2A45] mb-2">15. Contacto</h2>
            <p>
              Cualquier consulta puede dirigirse a{" "}
              <a href="mailto:legal@glob.ar" className="text-[#0E6BA8] font-medium">legal@glob.ar</a>.
            </p>
          </section>
        </article>
      </div>
      <Footer />
    </div>
  );
}
