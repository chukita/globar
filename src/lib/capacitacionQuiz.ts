export type QuizQuestion = { id: string; q: string; options: string[] };

type QuizInterno = QuizQuestion & { correct: number };

// Placeholder reemplazado en getQuizPublico() por la cantidad de cuotas
// vigente (tabla `configuracion`, editable en /admin/configuracion) — así
// el quiz no queda con un número de meses hardcodeado que se desactualiza
// cada vez que el superadmin cambia esa regla de negocio.
const MESES_PLACEHOLDER = "{{comisionMeses}}";

// Las respuestas correctas (`correct`) nunca deben llegar al cliente — usar
// siempre `getQuizPublico()` para lo que se renderiza en el browser, y
// `validarQuiz()` (server-side, en la action) para corregir.
const QUIZZES: Record<string, QuizInterno[]> = {
  nume: [
    {
      id: "q1",
      q: "¿Para qué tipo de negocios está pensado NuMe?",
      options: [
        "Peluquerías y centros de estética",
        "Bares, rotiserías y casas de comida en general",
        "Farmacias y dietéticas",
      ],
      correct: 1,
    },
    {
      id: "q2",
      q: "Cuando un cliente envía un pedido desde la carta digital, ¿cómo le llega al negocio?",
      options: [
        "Por email al dueño del local",
        "Por llamada telefónica automática",
        "Al WhatsApp del negocio y al panel de administración de NuMe",
      ],
      correct: 2,
    },
    {
      id: "q3",
      q: "¿Cuál es la primera acción que debe hacer un negocio al ingresar a NuMe?",
      options: [
        "Activar el plan PRO para tener acceso completo",
        "Cargar la carta: definir las categorías y los platos",
        "Configurar el QR imprimible para las mesas",
      ],
      correct: 1,
    },
  ],
  agendaonline: [
    {
      id: "q1",
      q: "¿Qué tiene que hacer primero un negocio para empezar a usar agendaonline?",
      options: [
        "Instalar una app en su celular",
        "Crear su agenda: cargar servicios, horarios y profesionales del local",
        "Contratar un plan anual obligatorio",
      ],
      correct: 1,
    },
    {
      id: "q2",
      q: "¿Cómo le mostrás a un cliente potencial que la reserva de turnos funciona?",
      options: [
        "Reservando un turno de prueba desde la página pública del negocio, como lo haría un cliente",
        "Llamando por teléfono al soporte de agendaonline",
        "No hace falta probarlo, se activa solo",
      ],
      correct: 0,
    },
    {
      id: "q3",
      q: "¿Cómo cobra la comisión el revendedor por una venta?",
      options: [
        "Un pago único apenas se registra el cliente",
        `En cuotas mensuales — hasta ${MESES_PLACEHOLDER} meses — mientras el cliente siga pagando su suscripción`,
        "De por vida, mientras el cliente siga siendo suscriptor",
      ],
      correct: 1,
    },
  ],
};

// Único criterio de "requiere capacitación para activarse": tener un quiz
// configurado acá. Se deriva de QUIZZES en vez de mantener una lista aparte,
// para que no pueda desincronizarse entre las páginas que la usan
// (capacitación, mis productos, landing pública del revendedor).
export const PRODUCTOS_CON_EVALUACION = new Set(Object.keys(QUIZZES));

export function getQuizPublico(productoNombre: string, comisionMeses: number): QuizQuestion[] | null {
  const quiz = QUIZZES[productoNombre];
  if (!quiz) return null;
  return quiz.map(({ id, q, options }) => ({
    id,
    q,
    options: options.map((o) => o.replaceAll(MESES_PLACEHOLDER, String(comisionMeses))),
  }));
}

export function validarQuiz(productoNombre: string, respuestas: Record<string, number>): boolean {
  const quiz = QUIZZES[productoNombre];
  if (!quiz) return false;
  return quiz.every((item) => respuestas[item.id] === item.correct);
}
