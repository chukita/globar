import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getRevendedorByUserId } from "@/lib/revendedor";
import QRCode from "qrcode";
import { Document, Page, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { TarjetaCard } from "./TarjetaCard";

// 2 columnas x 5 filas = 10 tarjetas CR80 (85x54mm) por hoja A4.
const CARDS_PER_SHEET = 10;

// 2*margenH + 2*85mm (ancho tarjeta) + 3mm (gap) = 210mm (ancho A4)
// 2*margenV + 5*54mm (alto tarjeta) + 4*3mm (gap) = 297mm (alto A4)
const styles = StyleSheet.create({
  page: {
    padding: "7.5mm 18.5mm",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: "3mm",
    alignContent: "flex-start",
    justifyContent: "center",
  },
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const [user] = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.email, session.user.email)).limit(1);
  if (!user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });

  const rev = await getRevendedorByUserId(user.id);
  if (!rev) return NextResponse.json({ error: "Todavía no tenés un código de ventas asignado." }, { status: 400 });

  const linkGeneral = `${process.env.AUTH_URL || "http://localhost:3000"}/r/${rev.codigoVentas}`;
  const qrDataUrl = await QRCode.toDataURL(linkGeneral, { margin: 1, width: 300 });

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        {Array.from({ length: CARDS_PER_SHEET }).map((_, i) => (
          <TarjetaCard
            key={i}
            nombre={user.name ?? "Revendedor/a"}
            telefono={rev.telefono}
            email={user.email}
            codigoVentas={rev.codigoVentas}
            qrDataUrl={qrDataUrl}
          />
        ))}
      </Page>
    </Document>
  );

  const buffer = await renderToBuffer(doc);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="tarjetas-${rev.codigoVentas}.pdf"`,
    },
  });
}
