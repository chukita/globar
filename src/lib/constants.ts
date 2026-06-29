export const COMMISSION_PER_MONTH = 7000;
export const MONTHLY_PRICE = 9000;
export const COMMISSION_PER_SALE = COMMISSION_PER_MONTH * 3; // 21000

export function fmtARS(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-AR");
}

export const PRODUCTS = [
  {
    key: "agendaonline",
    name: "agendaonline",
    domain: "agendaonline.com.ar",
    tag: "Turnos & reservas",
    desc: "Sistema de reservas y gestión de turnos para profesionales, estudios y clínicas.",
    accent: "#0B5A8F",
    tint: "#E1EFF8",
    letter: "a",
    letterBg: "#E1EFF8",
    letterFg: "#0B5A8F",
  },
  {
    key: "nume",
    name: "nume",
    domain: "nume.com.ar",
    tag: "Gastronomía",
    desc: "Carta digital para restaurantes con gestión de menú y precios en tiempo real.",
    accent: "#9B4A57",
    tint: "#FCE6E9",
    letter: "n",
    letterBg: "#FCE6E9",
    letterFg: "#9B4A57",
  },
];

export const STEPS = [
  {
    n: "01",
    title: "Registrate gratis",
    desc: "Creá tu cuenta de revendedor en minutos y obtené tu código de ventas único.",
    tint: "#E1EFF8",
    accent: "#0B5A8F",
  },
  {
    n: "02",
    title: "Conocé y ofrecé los productos",
    desc: "Familiarizate con nuestros productos, y ofrecelos a tus contactos y clientes, te ayudamos en todo el proceso.",
    tint: "#FCE6E9",
    accent: "#9B4A57",
  },
  {
    n: "03",
    title: "El cliente se suscribe, vos cobrás",
    desc: "Cada suscripción se registra sola y cobrás tu comisión durante 3 meses consecutivos.",
    tint: "#E1EFF8",
    accent: "#0B5A8F",
  },
];

export const REQUISITOS = [
  {
    n: "01",
    title: "Edad",
    desc: "Ser mayor de 18 años.",
    tag: "Obligatorio",
    tint: "#E1EFF8",
    accent: "#0B5A8F",
  },
  {
    n: "02",
    title: "Documentación",
    desc: "DNI argentino vigente.",
    tag: "Identidad",
    tint: "#FCE6E9",
    accent: "#9B4A57",
  },
  {
    n: "03",
    title: "Situación fiscal",
    desc: "Estar inscripto en el régimen de Monotributo para poder emitir facturas y cobrar por tu trabajo.",
    tag: "Obligatorio",
    tint: "#E1EFF8",
    accent: "#0B5A8F",
  },
  {
    n: "04",
    title: "Cuenta bancaria",
    desc: "Tener un CBU a tu nombre para recibir los pagos de tus comisiones.",
    tag: "Para cobrar",
    tint: "#FCE6E9",
    accent: "#9B4A57",
  },
];

export const PALETTE = [
  { name: "Bleu de France", hex: "#0E6BA8", fg: "#FFFFFF" },
  { name: "Misty rose", hex: "#FADADD", fg: "#9B4A57" },
  { name: "Navy ink", hex: "#0C2A45", fg: "#FFFFFF" },
  { name: "Blue tint", hex: "#E1EFF8", fg: "#0B5A8F" },
  { name: "Off-white", hex: "#F7F8FA", fg: "#0C2A45" },
  { name: "Rosa profundo", hex: "#9B4A57", fg: "#FFFFFF" },
];
