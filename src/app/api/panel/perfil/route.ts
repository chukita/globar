import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, revendedores } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { cbu } = await req.json();

  if (cbu !== undefined) {
    if (cbu !== "" && !/^\d{22}$/.test(cbu)) {
      return NextResponse.json({ error: "El CBU debe tener exactamente 22 dígitos." }, { status: 400 });
    }

    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, session.user.email)).limit(1);
    if (!user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });

    await db.update(revendedores).set({ cbu: cbu || null }).where(eq(revendedores.userId, user.id));
  }

  return NextResponse.json({ ok: true });
}
