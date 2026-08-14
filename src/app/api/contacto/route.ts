import { NextRequest, NextResponse } from "next/server";
import { esEmailValido } from "@/lib/validacion";
import { sendEmail, emailContacto } from "@/lib/email";
import { db } from "@/db";
import { contactos } from "@/db/schema";

interface ContactoBody {
  nombre?: string;
  email?: string;
  mensaje?: string;
  // Campo honeypot: invisible para una persona real, los bots de spam
  // suelen completar todos los campos del formulario a ciegas. Si viene
  // con contenido, respondemos ok silenciosamente sin mandar nada — así
  // no le damos ninguna señal al bot de que fue detectado.
  web?: string;
}

export async function POST(req: NextRequest) {
  let body: ContactoBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { nombre, email, mensaje, web } = body;

  if (web) {
    return NextResponse.json({ ok: true });
  }

  if (!nombre?.trim() || !email?.trim() || !mensaje?.trim()) {
    return NextResponse.json({ error: "Completá nombre, email y mensaje." }, { status: 400 });
  }
  if (!esEmailValido(email)) {
    return NextResponse.json({ error: "Ingresá un email válido." }, { status: 400 });
  }

  await db.insert(contactos).values({ nombre: nombre.trim(), email: email.trim(), mensaje: mensaje.trim() });

  const { subject, html } = emailContacto(nombre.trim(), email.trim(), mensaje.trim());
  await sendEmail({ to: "hola@glob.ar", subject, html, replyTo: email.trim() });

  return NextResponse.json({ ok: true });
}
