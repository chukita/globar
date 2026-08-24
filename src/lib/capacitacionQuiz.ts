export type QuizQuestion = { id: string; q: string; options: string[] };

type QuizInterno = QuizQuestion & { correct: number };

// Las respuestas correctas (`correct`) nunca deben llegar al cliente — usar
// siempre `getQuizPublico()` para lo que se renderiza en el browser, y
// `validarQuiz()` (server-side, en la action) para corregir.
const QUIZZES: Record<string, QuizInterno[]> = {
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
        "En varias cuotas mensuales, hasta un máximo de meses, mientras el cliente siga pagando su suscripción",
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

export function getQuizPublico(productoNombre: string): QuizQuestion[] | null {
  const quiz = QUIZZES[productoNombre];
  if (!quiz) return null;
  return quiz.map(({ id, q, options }) => ({ id, q, options }));
}

export function validarQuiz(productoNombre: string, respuestas: Record<string, number>): boolean {
  const quiz = QUIZZES[productoNombre];
  if (!quiz) return false;
  return quiz.every((item) => respuestas[item.id] === item.correct);
}
