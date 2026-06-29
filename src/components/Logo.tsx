interface LogoProps {
  size?: "sm" | "md" | "lg";
  darkText?: boolean;
}

export function Logo({ size = "md", darkText = false }: LogoProps) {
  const sizes = {
    sm: { box: 30, boxR: 8, g: 18, dot: 4, dotPos: 5, text: 18 },
    md: { box: 34, boxR: 9, g: 21, dot: 5, dotPos: 6, text: 20 },
    lg: { box: 64, boxR: 16, g: 38, dot: 8, dotPos: 11, text: 38 },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative flex items-center justify-center bg-[#0E6BA8] flex-shrink-0"
        style={{ width: s.box, height: s.box, borderRadius: s.boxR }}
      >
        <span
          className="font-bold text-white leading-none"
          style={{ fontFamily: "Open Sans", fontSize: s.g }}
        >
          g
        </span>
        <span
          className="absolute rounded-full bg-[#FADADD]"
          style={{
            width: s.dot,
            height: s.dot,
            right: s.dotPos,
            bottom: s.dotPos,
          }}
        />
      </div>
      <span
        className="font-bold tracking-tight"
        style={{
          fontSize: s.text,
          color: darkText ? "#0C2A45" : "#fff",
          fontFamily: "Open Sans",
          letterSpacing: "-0.03em",
        }}
      >
        glob<span style={{ color: darkText ? "#0E6BA8" : "#7FB4DC" }}>.ar</span>
      </span>
    </div>
  );
}
