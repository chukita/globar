interface LogoProps {
  size?: "sm" | "md" | "lg";
  darkText?: boolean;
}

const heights: Record<string, number> = { sm: 30, md: 36, lg: 56 };

export function Logo({ size = "md", darkText = false }: LogoProps) {
  const h = heights[size] ?? 36;
  // darkText = página clara → el logo PNG tiene texto blanco, no se ve sobre blanco.
  // En ese caso renderizamos el logo SVG inline (versión oscura).
  if (darkText) {
    return <LogoDark height={h} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo-glob.png" alt="glob.ar" height={h} style={{ height: h, width: "auto", display: "block" }} />
  );
}

// Logo SVG para fondos claros (texto navy + azul)
function LogoDark({ height }: { height: number }) {
  const scale = height / 36;
  const boxSize  = Math.round(34 * scale);
  const boxR     = Math.round(9  * scale);
  const fontSize = Math.round(21 * scale);
  const dot      = Math.round(5  * scale);
  const dotPos   = Math.round(6  * scale);
  const textSize = Math.round(20 * scale);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: Math.round(10 * scale) }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: "#0E6BA8", width: boxSize, height: boxSize, borderRadius: boxR, flexShrink: 0 }}>
        <span style={{ fontFamily: "Open Sans, sans-serif", fontWeight: 700, color: "#fff", fontSize, lineHeight: 1 }}>g</span>
        <span style={{ position: "absolute", width: dot, height: dot, borderRadius: "50%", background: "#FADADD", right: dotPos, bottom: dotPos }} />
      </div>
      <span style={{ fontFamily: "Open Sans, sans-serif", fontWeight: 700, fontSize: textSize, color: "#0C2A45", letterSpacing: "-0.03em" }}>
        glob<span style={{ color: "#0E6BA8" }}>.ar</span>
      </span>
    </div>
  );
}
