import { fmtARS } from "@/lib/constants";

/**
 * Textos de las páginas públicas pensadas para buscadores y asistentes de IA:
 * preguntas frecuentes, una página por producto (/revender/[producto]) y las
 * guías (/guias/[slug]). La comisión llega por parámetro (sale de
 * `configuracion`) para que nunca quede un monto viejo escrito en el texto.
 *
 * Los datos de cada producto (planes, funciones, rubros) son los que publica
 * cada producto en su propio /llms.txt: si cambian allá, actualizarlos acá.
 */

export type Comision = { monto: number; meses: number };

export type Pregunta = { q: string; a: string };

export type Bloque = { h2: string; p?: string[]; lista?: string[] };

const total = (c: Comision) => c.monto * c.meses;

/**
 * Preguntas frecuentes. Las primeras 6 son las de la home (sección
 * #preguntas); /preguntas muestra todas. Respuestas cortas y con números:
 * es lo que mejor citan ChatGPT y compañía.
 */
export function preguntasFrecuentes(c: Comision): Pregunta[] {
  return [
    {
      q: "¿Qué es glob.ar?",
      a: "Es el programa de revendedores de dos productos de software argentinos: Agenda Online (turnos y reservas online) y NuMe (menú digital con QR). Te registrás gratis, compartís tu link y cobrás una comisión mensual por cada cliente que se suscribe.",
    },
    {
      q: "¿Cuánto se gana por cada venta?",
      a: `${fmtARS(c.monto)} por mes durante ${c.meses} meses por cada cliente que se suscribe con tu link: ${fmtARS(total(c))} por venta. Es la misma comisión para los dos productos y no hay tope de clientes.`,
    },
    {
      q: "¿Tiene algún costo registrarse?",
      a: "No. Registrarse es gratis y no hay inversión inicial, cuota ni stock. Solo compartís tu link de referido.",
    },
    {
      q: "¿Qué requisitos hay para ser revendedor?",
      a: "Ser mayor de 18 años, vivir en Argentina y poder emitir factura por tus comisiones (Monotributo u otro régimen). Para cobrar necesitás además DNI y un CBU o alias a tu nombre.",
    },
    {
      q: "¿Cómo y cuándo cobro las comisiones?",
      a: "Las comisiones del mes se transfieren a tu CBU o alias a principio del mes siguiente. Después subís la factura por ese monto desde tu panel.",
    },
    {
      q: "¿Necesito experiencia en ventas?",
      a: "No. En el panel tenés una capacitación en video, una guía de ventas y tu link o QR listo para compartir por WhatsApp o redes. Los productos tienen plan gratis, así que el cliente puede probarlos antes de pagar.",
    },
    {
      q: "¿Qué pasa si el cliente arranca con el plan gratis?",
      a: "Queda registrado como tuyo desde que se da de alta con tu link, y lo ves en tu panel como \"registrado\". Si más adelante pasa a un plan pago, la comisión es tuya igual.",
    },
    {
      q: "¿Qué pasa si el cliente deja de pagar?",
      a: `Cobrás una comisión por cada mes que el cliente pague, hasta ${c.meses} meses. Si se da de baja antes, se dejan de generar las comisiones de los meses siguientes; las que ya se generaron no se pierden.`,
    },
    {
      q: "¿Tengo que cobrarle yo al cliente o darle soporte?",
      a: "No. El cliente se suscribe y paga directamente al producto con Mercado Pago, y el soporte técnico lo da el equipo de cada producto. Vos solo lo recomendás y lo acompañás si querés.",
    },
    {
      q: "¿Puedo vender en cualquier lugar de Argentina?",
      a: "Sí. Los productos funcionan en todo el país y todo se hace online: el cliente se registra desde tu link sin que tengas que ir al local.",
    },
    {
      q: "¿Hay un mínimo de ventas o un tope?",
      a: "No hay mínimo para seguir siendo revendedor ni tope de clientes. Podés hacerlo como ingreso extra con pocos clientes o dedicarle más tiempo.",
    },
    {
      q: "¿Puedo ser revendedor sin ser monotributista?",
      a: "Para cobrar tenés que poder emitir factura por las comisiones: Monotributo o Responsable Inscripto. Podés registrarte y empezar a compartir tu link mientras hacés el alta en ARCA.",
    },
    {
      q: "¿Cómo me entero de que alguien se registró con mi link?",
      a: "En tu panel, en \"Mis clientes\", ves a cada negocio que se registró con tu link y cuáles ya se suscribieron. En \"Comisiones\" ves cuánto llevás generado y cuándo cobrás.",
    },
  ];
}

export type ProductoLanding = {
  key: "agendaonline" | "nume";
  nombre: string;
  dominio: string;
  titulo: string;
  descripcion: string;
  bajada: string;
  rubros: string[];
  porQue: string[];
  planes: string;
  pitch: string;
  preguntas: (c: Comision) => Pregunta[];
};

export const PRODUCTOS_LANDING: ProductoLanding[] = [
  {
    key: "agendaonline",
    nombre: "Agenda Online",
    dominio: "agendaonline.com.ar",
    titulo: "Revendé Agenda Online: turnos online para peluquerías, estética y consultorios",
    descripcion:
      "Ganá comisiones recomendando Agenda Online, el sistema de turnos online para peluquerías, barberías, estética, consultorios y canchas. Plan gratis para el cliente, sin inversión para vos.",
    bajada:
      "El sistema de reservas de turnos online para negocios que atienden con turno. El cliente reserva desde el celular sin llamar ni escribir por WhatsApp, y el dueño maneja todo desde un panel.",
    rubros: [
      "Peluquerías", "Barberías", "Centros de estética", "Uñas", "Pestañas y cejas", "Tatuajes",
      "Peluquería canina", "Consultorios y kinesiología", "Estudios contables y jurídicos",
      "Entrenadores", "Canchas de pádel y fútbol",
    ],
    porQue: [
      "Tiene plan gratis de por vida (hasta 50 reservas por mes, sin tarjeta): el negocio lo prueba sin riesgo.",
      "Resuelve un dolor diario: los turnos por WhatsApp a toda hora y los clientes que no vienen.",
      "Cobra seña con Mercado Pago y manda recordatorios, así bajan las ausencias.",
      "El cliente final no descarga nada: reserva desde un link o un QR.",
      "Muestra los clientes que no vuelven hace semanas y los invita por WhatsApp con un toque.",
    ],
    planes:
      "Plan Free gratis (hasta 50 reservas por mes), Básico con reservas sin límite y Pro con recordatorios por WhatsApp. Se paga por mes con Mercado Pago y se cancela cuando quiera.",
    pitch:
      "\"¿Seguís dando turnos por WhatsApp? Con esto tus clientes reservan solos desde el celular, te pagan la seña por Mercado Pago y les llega un recordatorio. Arrancás gratis.\"",
    preguntas: (c) => [
      {
        q: "¿Cuánto gano por cada negocio que se suscribe a Agenda Online?",
        a: `${fmtARS(c.monto)} por mes durante ${c.meses} meses (${fmtARS(total(c))} en total), sea plan Básico o Pro.`,
      },
      {
        q: "¿El negocio tiene que pagar para probarlo?",
        a: "No. Tiene un plan gratis de por vida con hasta 50 reservas por mes. Si se registra con tu link y después pasa a un plan pago, la comisión es tuya.",
      },
      {
        q: "¿Tengo que configurarle la agenda al negocio?",
        a: "No hace falta: al registrarse, Agenda Online lo guía paso a paso para cargar servicios, horarios y profesionales. Si querés, podés ayudarlo y eso suele cerrar la venta.",
      },
    ],
  },
  {
    key: "nume",
    nombre: "NuMe",
    dominio: "nume.com.ar",
    titulo: "Revendé NuMe: menú digital con QR para bares, restaurantes y rotiserías",
    descripcion:
      "Ganá comisiones recomendando NuMe, la carta digital con QR para bares, restaurantes, rotiserías y viandas, con pedidos por WhatsApp y reservas. Sin inversión.",
    bajada:
      "La carta digital con QR para gastronomía. El local carga su menú una vez, cambia precios desde el celular al instante y recibe pedidos por WhatsApp y reservas de mesa.",
    rubros: ["Bares", "Restaurantes", "Cafeterías", "Rotiserías", "Viandas", "Parrillas", "Pizzerías", "Hamburgueserías"],
    porQue: [
      "Tiene plan gratis: el local arma su carta y la prueba antes de pagar.",
      "Con la inflación, cambiar precios sin reimprimir la carta es un ahorro inmediato.",
      "Los pedidos llegan por WhatsApp, completos y por escrito, sin comisiones por venta.",
      "La misma carta sirve para el QR de la mesa, Instagram y Google Maps.",
      "El cliente final no instala nada: la carta se abre en el navegador.",
    ],
    planes:
      "Plan Free gratis (hasta 4 platos, pedidos con tope diario) y plan Pro con platos ilimitados, logo propio, reservas y pedidos sin tope. Se paga por mes con Mercado Pago.",
    pitch:
      "\"¿Cuántas veces reimprimiste la carta este año? Con NuMe cambiás los precios desde el celular y se actualizan en el QR al toque. Además te llegan los pedidos por WhatsApp. Lo probás gratis.\"",
    preguntas: (c) => [
      {
        q: "¿Cuánto gano por cada local que se suscribe a NuMe?",
        a: `${fmtARS(c.monto)} por mes durante ${c.meses} meses (${fmtARS(total(c))} en total) por cada local que pasa al plan Pro con tu link.`,
      },
      {
        q: "¿NuMe le cobra comisión al local por los pedidos?",
        a: "No. Los pedidos llegan al WhatsApp del local y NuMe no intermedia el pago ni cobra por pedido: es un abono mensual fijo.",
      },
      {
        q: "¿A qué locales conviene ofrecerlo?",
        a: "A los que tienen carta impresa o en PDF, a los que reciben pedidos por WhatsApp de forma desordenada y a los que cambian precios seguido.",
      },
    ],
  },
];

export function productoLanding(key: string) {
  return PRODUCTOS_LANDING.find((p) => p.key === key);
}

export type Guia = {
  slug: string;
  titulo: string;
  descripcion: string;
  publicada: string; // ISO, para el JSON-LD
  bloques: (c: Comision) => Bloque[];
};

export const GUIAS: Guia[] = [
  {
    slug: "ganar-plata-extra-recomendando-software",
    titulo: "Cómo ganar plata extra recomendando software, sin invertir",
    descripcion:
      "Una forma concreta de sumar ingresos en Argentina: recomendar herramientas digitales a negocios de tu zona y cobrar una comisión mensual por cada uno que se suscribe.",
    publicada: "2026-10-29",
    bloques: (c) => [
      {
        h2: "La idea en dos líneas",
        p: [
          `Muchos negocios todavía dan turnos por WhatsApp o tienen la carta impresa. Si les recomendás una herramienta que les resuelve eso y se suscriben con tu link, cobrás ${fmtARS(c.monto)} por mes durante ${c.meses} meses: ${fmtARS(total(c))} por cada negocio.`,
          "No comprás nada, no tenés stock y no le cobrás al cliente: él paga directo al producto y vos cobrás la comisión.",
        ],
      },
      {
        h2: "Qué podés recomendar",
        lista: [
          "Agenda Online: turnos online para peluquerías, barberías, estética, consultorios y canchas.",
          "NuMe: carta digital con QR, pedidos por WhatsApp y reservas para bares, restaurantes y rotiserías.",
        ],
        p: ["Los dos tienen plan gratis, así que el negocio lo prueba sin riesgo y no tenés que convencerlo de pagar el primer día."],
      },
      {
        h2: "Por dónde empezar",
        lista: [
          "Pensá en los negocios que ya conocés: tu peluquería, el bar del barrio, el consultorio de un amigo.",
          "Mirá si dan turnos por WhatsApp o si la carta tiene precios tachados: ahí hay una oportunidad.",
          "Mandales tu link con un mensaje corto y ofrecé ayudarlos a configurarlo.",
          "Publicá tu link o tu QR en tus redes y en grupos de comerciantes de tu zona.",
        ],
      },
      {
        h2: "Cuánto se puede ganar",
        p: [
          `Con 5 negocios suscriptos cobrás ${fmtARS(c.monto * 5)} por mes; con 10, ${fmtARS(c.monto * 10)}. Cada negocio paga comisión durante ${c.meses} meses, así que si sumás clientes todos los meses el ingreso se va acumulando.`,
        ],
      },
      {
        h2: "Qué necesitás",
        lista: [
          "Ser mayor de 18 y vivir en Argentina.",
          "Poder facturar las comisiones (Monotributo u otro régimen).",
          "Un CBU o alias a tu nombre para recibir las transferencias.",
        ],
        p: ["El registro en glob.ar es gratis y en el panel tenés una capacitación corta en video."],
      },
    ],
  },
  {
    slug: "afiliado-o-revendedor",
    titulo: "Programa de afiliados o de revendedores: diferencias y cuál te conviene",
    descripcion:
      "Afiliados de tiendas online y revendedores de software parecen lo mismo, pero se cobran distinto. Qué cambia en la comisión, en el esfuerzo y en cuánto dura el ingreso.",
    publicada: "2026-10-29",
    bloques: (c) => [
      {
        h2: "Afiliados: comisión por compra",
        p: [
          "En los programas de afiliados de tiendas online compartís un link a un producto y cobrás un porcentaje cuando alguien lo compra. Funciona bien si tenés mucha audiencia: cada venta deja poco y se cobra una sola vez.",
        ],
      },
      {
        h2: "Revendedor de software: comisión mensual",
        p: [
          `Con el software por suscripción el cliente paga todos los meses, y eso permite comisiones recurrentes. En glob.ar cobrás ${fmtARS(c.monto)} por mes durante ${c.meses} meses por cada negocio (${fmtARS(total(c))} en total), así que no necesitás miles de seguidores: con pocos clientes ya se nota.`,
        ],
      },
      {
        h2: "Comparación rápida",
        lista: [
          "A quién le vendés: afiliado, a consumidores finales; revendedor de software, a negocios.",
          "Cuánto deja cada venta: afiliado, un porcentaje chico de una compra; revendedor, un monto fijo varios meses.",
          "Cómo se consigue: afiliado, con alcance en redes; revendedor, con contactos y conversaciones uno a uno.",
          "Cuánto dura: afiliado, se cobra una vez; revendedor, se cobra mientras el cliente siga pagando, hasta el tope del programa.",
        ],
      },
      {
        h2: "Cuál te conviene",
        p: [
          "Si tenés mucha audiencia y te gusta recomendar productos variados, el modelo de afiliados es cómodo. Si conocés comerciantes, trabajás con negocios o te gusta asesorar, revender software te deja más por cada cliente.",
          "Se pueden combinar: no hay exclusividad.",
        ],
      },
    ],
  },
  {
    slug: "facturar-comisiones-monotributo",
    titulo: "Cómo facturar tus comisiones de revendedor con Monotributo",
    descripcion:
      "Qué necesitás para cobrar comisiones como revendedor en Argentina: alta en el Monotributo, qué factura emitir y cómo se hace el circuito en glob.ar.",
    publicada: "2026-10-29",
    bloques: () => [
      {
        h2: "Por qué hay que facturar",
        p: [
          "Las comisiones son un ingreso por un servicio de intermediación, así que quien te paga necesita una factura. Por eso en glob.ar es requisito poder facturar: Monotributo o Responsable Inscripto.",
        ],
      },
      {
        h2: "Si todavía no sos monotributista",
        lista: [
          "Necesitás CUIT y clave fiscal en ARCA (ex AFIP).",
          "El alta en el Monotributo se hace online desde el sitio de ARCA, eligiendo una actividad de servicios y la categoría que corresponda a lo que pensás facturar.",
          "Si tenés dudas sobre la actividad o la categoría, consultá con un contador: es una charla corta y evita problemas después.",
        ],
        p: ["Mientras tanto podés registrarte en glob.ar y empezar a compartir tu link: la factura se pide recién cuando cobrás."],
      },
      {
        h2: "Qué factura emitir",
        p: [
          "Como monotributista emitís Factura C. Se hace gratis desde ARCA, en \"Comprobantes en línea\". En tu panel de glob.ar, sección Facturas, tenés una guía paso a paso con todos los datos ya cargados: CUIT del receptor, monto exacto y concepto.",
        ],
      },
      {
        h2: "Cómo es el circuito en glob.ar",
        lista: [
          "A principio de mes te transferimos las comisiones generadas el mes anterior.",
          "Emitís la factura por ese monto exacto y la subís en PDF desde tu panel.",
          "La revisamos y queda aprobada. Si falta una factura, el pago siguiente se acumula hasta que la subas: no se pierde nada.",
        ],
      },
    ],
  },
  {
    slug: "como-ofrecer-turnos-online-a-un-negocio",
    titulo: "Cómo ofrecerle turnos online o una carta digital a un negocio",
    descripcion:
      "Guía práctica para revendedores: a qué negocios ir, qué decirles, cómo responder las dudas más comunes y cómo cerrar sin presionar.",
    publicada: "2026-10-29",
    bloques: () => [
      {
        h2: "Elegí bien a quién",
        lista: [
          "Turnos online (Agenda Online): peluquerías, barberías, estética, uñas, consultorios, entrenadores y canchas que hoy coordinan por WhatsApp.",
          "Carta digital (NuMe): bares, restaurantes, rotiserías y viandas con carta impresa, PDF o precios que cambian seguido.",
        ],
      },
      {
        h2: "Empezá por el problema, no por el producto",
        p: [
          "Preguntá cómo dan los turnos o cada cuánto cambian los precios. Si te cuentan que contestan WhatsApp a la noche o que reimprimen la carta, ya tenés la conversación armada.",
        ],
      },
      {
        h2: "Mostralo funcionando",
        p: [
          "Las dos herramientas tienen ejemplos en vivo. Abrí la página de reservas o la carta de ejemplo desde tu celular y mostrásela: se entiende en 30 segundos.",
        ],
      },
      {
        h2: "Respuestas a las dudas de siempre",
        lista: [
          "\"No tengo tiempo de configurarlo\": se arma en unos minutos y podés ofrecer ayudar.",
          "\"Mis clientes no van a usar una app\": no hay que instalar nada, es un link.",
          "\"No quiero pagar otra cosa\": arranca gratis y paga solo si le sirve.",
        ],
      },
      {
        h2: "Cerrá con tu link",
        p: [
          "Mandale tu link por WhatsApp o mostrale tu QR para que se registre en el momento. Que se registre con tu link es lo que hace que la comisión sea tuya, aunque empiece con el plan gratis.",
          "Después, un mensaje a la semana para ver si pudo configurarlo suele ser lo que convierte la prueba en suscripción.",
        ],
      },
    ],
  },
];

export function guia(slug: string) {
  return GUIAS.find((g) => g.slug === slug);
}

/**
 * openGraph por página. Next mezcla la metadata de forma superficial: si una
 * página define `openGraph`, reemplaza entero el del layout (imagen incluida),
 * y si no lo define hereda el de la home (con su título y su URL). Por eso las
 * páginas públicas arman el suyo con esto.
 */
export function ogPagina(o: { titulo: string; descripcion: string; path: string; tipo?: "website" | "article" }) {
  return {
    type: o.tipo ?? "website",
    siteName: "glob.ar",
    locale: "es_AR",
    url: `https://glob.ar${o.path}`,
    title: o.titulo,
    description: o.descripcion,
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "glob.ar: recomendá software a negocios y ganá comisiones" }],
  };
}
