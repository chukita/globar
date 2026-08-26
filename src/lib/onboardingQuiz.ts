import type { QuizQuestion } from "@/lib/capacitacionQuiz";

type QuizInterno = QuizQuestion & { correct: number };

// Mismo placeholder que capacitacionQuiz.ts (comisionMeses cambia desde
// /admin/configuracion) — se repite acá en vez de importarlo porque este
// módulo es intencionalmente independiente: no hay un producto "globar" en
// la tabla `productos`, este quiz no participa de PRODUCTOS_CON_EVALUACION
// ni de `habilitaciones`. Gatea todo el panel vía revendedores.onboardingCompletedAt.
const MESES_PLACEHOLDER = "{{comisionMeses}}";

// PLACEHOLDER — Carlos: revisar y ajustar estas preguntas antes de shippear
// a producción. Redactadas con el mismo tono que el quiz de agendaonline,
// pero sin contenido real todavía (no existía guión del video al momento
// de escribir esto).
const ONBOARDING_QUIZ: QuizInterno[] = [
  {
    id: "q1",
    q: "¿Qué es glob.ar para vos como revendedor?",
    options: [
      "Una plataforma desde la que revendés productos digitales propios (como agendaonline) y cobrás una comisión por cada cliente que sumás",
      "Un curso pago de ventas",
      "Un producto que tenés que comprar antes de poder venderlo",
    ],
    correct: 0,
  },
  {
    id: "q2",
    q: "¿Dónde conseguís tu link de referido para compartir con clientes potenciales?",
    options: [
      "Te lo manda un superadmin por mail cada vez que lo necesitás",
      "En \"Mis productos\", dentro de tu panel — ya tiene tu código de vendedor cargado",
      "No hace falta un link, alcanza con mencionar tu nombre",
    ],
    correct: 1,
  },
  {
    id: "q3",
    q: "¿Qué tenés que hacer para poder vender un producto específico (por ejemplo agendaonline)?",
    options: [
      "Nada, todos los productos están habilitados desde el día uno",
      "Pagar una suscripción propia a ese producto",
      "Mirar su video de capacitación y aprobar su evaluación, desde \"Capacitación\"",
    ],
    correct: 2,
  },
  {
    id: "q4",
    q: "¿Cómo cobrás tu comisión cuando un cliente que registraste empieza a pagar su suscripción?",
    options: [
      "Un pago único al momento del registro, sin importar si el cliente sigue pagando",
      `En cuotas mensuales — hasta ${MESES_PLACEHOLDER} meses — mientras ese cliente siga pagando su suscripción`,
      "Solo si vendés más de 10 clientes por mes",
    ],
    correct: 1,
  },
  {
    id: "q5",
    q: "Tenés una duda sobre una comisión o una factura. ¿Qué hacés?",
    options: [
      "Escribís a soporte de glob.ar o revisás \"Facturas\"/\"Comisiones\" en tu panel",
      "Esperás a que se resuelva solo",
      "Creás una cuenta nueva",
    ],
    correct: 0,
  },
];

export function getOnboardingQuizPublico(comisionMeses: number): QuizQuestion[] {
  return ONBOARDING_QUIZ.map(({ id, q, options }) => ({
    id,
    q,
    options: options.map((o) => o.replaceAll(MESES_PLACEHOLDER, String(comisionMeses))),
  }));
}

export function validarOnboardingQuiz(respuestas: Record<string, number>): boolean {
  return ONBOARDING_QUIZ.every((item) => respuestas[item.id] === item.correct);
}
