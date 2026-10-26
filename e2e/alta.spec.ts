import { expect, test } from "@playwright/test";
import bcrypt from "bcryptjs";
import { getOnboardingQuizPublico, validarOnboardingQuiz } from "../src/lib/onboardingQuiz";
import { db, esperarFormularioListo, esperarPanel, uniq } from "./helpers";

/**
 * Alta completa de un revendedor por email, como la hace una persona:
 * registro → código por mail → onboarding de glob.ar (video + quiz) → panel
 * con los links de todos los productos (sin capacitación por producto).
 */

/** Combinación de respuestas que aprueba el quiz (se busca, no se hardcodea). */
function respuestasCorrectas(): number[] {
  const quiz = getOnboardingQuizPublico(4);
  const combo = quiz.map(() => 0);
  const total = quiz.reduce((acc, q) => acc * q.options.length, 1);
  for (let n = 0; n < total; n++) {
    let rest = n;
    const answers: Record<string, number> = {};
    quiz.forEach((q, i) => {
      combo[i] = rest % q.options.length;
      rest = Math.floor(rest / q.options.length);
      answers[q.id] = combo[i]!;
    });
    if (validarOnboardingQuiz(answers)) return [...combo];
  }
  throw new Error("ninguna combinación aprueba el quiz de onboarding");
}

test("un revendedor se registra por email, aprueba el onboarding de glob.ar y ya comparte todos los productos", async ({ page }) => {
  const u = uniq();
  const email = `alta-${u}@example.test`;

  // Primera visita desde ChatGPT: queda como origen del alta.
  await page.goto("/?utm_source=chatgpt.com");
  // La cookie de origen la deja un efecto del cliente al hidratar la home.
  await expect
    .poll(async () => (await page.context().cookies()).some((c) => c.name === "globar_ft"))
    .toBe(true);
  await page.goto("/registro");
  await esperarFormularioListo(page);
  await page.getByPlaceholder("Martina Quiroga").fill(`Alta E2E ${u}`);
  await page.getByPlaceholder("tu@email.com").fill(email);
  await page.getByPlaceholder("Mínimo 8 caracteres").fill("Alta-e2e-12345");
  await page.locator('input[type="date"]').fill("1992-03-15");
  const checks = page.locator('input[type="checkbox"]');
  await checks.nth(0).check();
  await checks.nth(1).check();
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/registro\/verificar/);

  // El código real viaja por mail: en la base se reemplaza por uno conocido.
  const user = await db().query<{ id: string }>(`select id from users where email = $1`, [email]);
  expect(user.rowCount).toBe(1);
  await db().query(`update verificaciones_email set codigo_hash = $2 where user_id = $1`, [
    user.rows[0]!.id,
    await bcrypt.hash("246810", 4),
  ]);

  await esperarFormularioListo(page);
  await page.getByPlaceholder("123456").fill("246810");
  await page.getByRole("button", { name: "Confirmar" }).click();

  // Único paso obligatorio: el onboarding de glob.ar (video + quiz).
  await expect(page).toHaveURL(/\/panel\/onboarding/, { timeout: 30_000 });
  // El Chromium de Playwright no reproduce mp4: se simula que el video terminó.
  await page.locator("video").evaluate((v) => v.dispatchEvent(new Event("ended")));
  await page.getByRole("button", { name: "Continuar a la evaluación" }).click();

  const quiz = getOnboardingQuizPublico(4);
  const correctas = respuestasCorrectas();
  for (const [i, q] of quiz.entries()) {
    await page.getByText(q.options[correctas[i]!]!.slice(0, 40)).first().click();
  }
  await page.getByRole("button", { name: "Enviar respuestas" }).click();
  // Al aprobar, el revalidatePath("/panel") de la acción re-renderiza la página
  // y la manda al panel (a veces antes de ver el "¡Listo!").
  const listo = page.getByText("¡Listo, ya sos parte de glob.ar!");
  const panel = page.getByRole("heading", { name: "Mis productos" });
  await expect(listo.or(panel)).toBeVisible({ timeout: 30_000 });
  if (await listo.isVisible()) await page.getByRole("button", { name: "Ir a mi panel" }).click();
  await esperarPanel(page);

  // En el panel ve su código de ventas.
  const rev = await db().query<{ codigo_ventas: string; signup_source: { utmSource?: string } | null }>(
    `select codigo_ventas, signup_source from revendedores where user_id = $1`,
    [user.rows[0]!.id],
  );
  const codigo = rev.rows[0]!.codigo_ventas;
  await page.goto("/panel/productos");
  await expect(page.getByText(codigo).first()).toBeVisible();
  // Todos los productos con su link, sin aprobar ninguna capacitación.
  await expect(page.getByText(`?vendedor=${codigo}`, { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Pendiente de activar")).toHaveCount(0);

  // Y el alta quedó atribuida a ChatGPT.
  expect(rev.rows[0]!.signup_source?.utmSource).toBe("chatgpt.com");
});
