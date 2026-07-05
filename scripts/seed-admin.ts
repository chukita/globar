import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const EMAIL    = "admin@globar.ar";
const PASSWORD = "globar2026";
const NAME     = "Grupo Globaliza";

async function main() {
  const [existing] = await db.select().from(users).where(eq(users.email, EMAIL)).limit(1);

  if (existing) {
    console.log(`✓ Usuario ya existe: ${EMAIL}`);
    process.exit(0);
  }

  const hash = await bcrypt.hash(PASSWORD, 12);

  await db.insert(users).values({
    email:    EMAIL,
    name:     NAME,
    password: hash,
    role:     "superadmin",
  });

  console.log("✓ Superadmin creado");
  console.log(`  Email:      ${EMAIL}`);
  console.log(`  Contraseña: ${PASSWORD}`);
  console.log("\n  → Cambiá la contraseña después del primer login.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
