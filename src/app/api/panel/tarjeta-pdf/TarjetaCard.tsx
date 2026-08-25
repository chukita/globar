import { Text, View, Image, StyleSheet } from "@react-pdf/renderer";

// Tamaño estándar CR80 (85 x 54 mm), la grilla de la página arma 2 columnas x
// 5 filas = 10 tarjetas por hoja A4.
export const CARD_WIDTH_MM = 85;
export const CARD_HEIGHT_MM = 54;

const NAVY = "#0C2A45";
const BLUE = "#0E6BA8";
const ROSE = "#FADADD";
const MUTED = "#5B6577";

const styles = StyleSheet.create({
  card: {
    width: `${CARD_WIDTH_MM}mm`,
    height: `${CARD_HEIGHT_MM}mm`,
    border: "0.75pt dashed #B4B2A9",
    borderRadius: 6,
    padding: "10pt 12pt",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  logoRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  logoBox: {
    width: 13,
    height: 13,
    backgroundColor: BLUE,
    borderRadius: 3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },
  logoG: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: 700,
  },
  logoDot: {
    position: "absolute",
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    backgroundColor: ROSE,
    right: -1.5,
    bottom: -1.5,
  },
  logoText: {
    fontSize: 9,
    color: NAVY,
    fontWeight: 700,
  },
  logoTextAccent: {
    color: BLUE,
  },
  bottomRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    paddingRight: 8,
  },
  nombre: {
    fontSize: 13,
    color: NAVY,
    fontWeight: 700,
  },
  rol: {
    fontSize: 8,
    color: MUTED,
    marginTop: 1,
  },
  contactos: {
    display: "flex",
    flexDirection: "column",
    marginTop: 5,
    gap: 2,
  },
  contactoLinea: {
    fontSize: 8,
    color: NAVY,
  },
  codigo: {
    fontSize: 7.5,
    color: BLUE,
    backgroundColor: "#E1EFF8",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
    marginTop: 5,
    alignSelf: "flex-start",
  },
  qrCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  qrImg: {
    width: 46,
    height: 46,
  },
  qrCaption: {
    fontSize: 6,
    color: MUTED,
    marginTop: 2,
    textAlign: "center",
  },
});

interface TarjetaCardProps {
  nombre: string;
  telefono: string | null;
  email: string | null;
  codigoVentas: string;
  qrDataUrl: string;
}

export function TarjetaCard({ nombre, telefono, email, codigoVentas, qrDataUrl }: TarjetaCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.logoRow}>
        <View style={{ position: "relative" }}>
          <View style={styles.logoBox}>
            <Text style={styles.logoG}>g</Text>
          </View>
          <View style={styles.logoDot} />
        </View>
        <Text style={styles.logoText}>
          glob<Text style={styles.logoTextAccent}>.ar</Text>
        </Text>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.info}>
          <Text style={styles.nombre}>{nombre}</Text>
          <Text style={styles.rol}>Revendedor/a Glob.ar</Text>
          <View style={styles.contactos}>
            {telefono && <Text style={styles.contactoLinea}>Tel: {telefono}</Text>}
            {email && <Text style={styles.contactoLinea}>{email}</Text>}
          </View>
          <Text style={styles.codigo}>{codigoVentas}</Text>
        </View>

        <View style={styles.qrCol}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- Image acá es de @react-pdf/renderer, no un <img> HTML */}
          <Image style={styles.qrImg} src={qrDataUrl} />
          <Text style={styles.qrCaption}>Mirá mi catálogo</Text>
        </View>
      </View>
    </View>
  );
}
