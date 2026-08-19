/** Ilustraciones de producto (home pública y landing general por vendedor `/r/[codigo]`). */

export function NumeIllustration() {
  return (
    <svg viewBox="0 0 560 180" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      {/* BG */}
      <rect width="560" height="180" fill="#F5F0E8"/>
      {/* Gradient top right */}
      <radialGradient id="ng1" cx="90%" cy="10%" r="50%">
        <stop offset="0%" stopColor="#CFEE6A" stopOpacity="0.5"/>
        <stop offset="100%" stopColor="#F5F0E8" stopOpacity="0"/>
      </radialGradient>
      <rect width="560" height="180" fill="url(#ng1)"/>

      {/* Badge */}
      <rect x="20" y="18" width="190" height="24" rx="12" fill="none" stroke="#1a1a1a" strokeWidth="1.2"/>
      <circle cx="34" cy="30" r="4" fill="#D94F3D"/>
      <text x="44" y="34.5" fontFamily="sans-serif" fontSize="9.5" fontWeight="700" fill="#1a1a1a" letterSpacing="1">NUEVO · DISPONIBLE PARA ARG</text>

      {/* Headline */}
      <text x="20" y="72" fontFamily="sans-serif" fontSize="28" fontWeight="900" fill="#1a1a1a">Carta digital</text>
      <text x="20" y="103" fontFamily="sans-serif" fontSize="28" fontWeight="900" fill="#1a1a1a">con QR y</text>
      <text x="20" y="134" fontFamily="sans-serif" fontSize="28" fontWeight="900" fill="#1a1a1a">reservas.</text>
      {/* Lime highlight under "reservas" */}
      <rect x="20" y="137" width="148" height="10" rx="2" fill="#CFEE6A" opacity="0.7"/>

      {/* Phone */}
      <rect x="330" y="8" width="210" height="165" rx="22" fill="#1a1a1a"/>
      <rect x="336" y="14" width="198" height="153" rx="18" fill="#FAFAF7"/>

      {/* Phone header */}
      <text x="350" y="38" fontFamily="sans-serif" fontSize="11" fontWeight="800" fill="#1a1a1a">Bodegón </text>
      <rect x="416" y="27" width="16" height="16" rx="3" fill="#CFEE6A"/>
      <text x="418.5" y="39" fontFamily="sans-serif" fontSize="10" fontWeight="900" fill="#1a1a1a">N</text>

      {/* Subheader */}
      <text x="350" y="55" fontFamily="sans-serif" fontSize="7.5" fontWeight="600" fill="#888" letterSpacing="0.5">¡HOLA! · MESA 12</text>
      <text x="350" y="70" fontFamily="sans-serif" fontSize="10.5" fontWeight="800" fill="#1a1a1a">¿Qué te servimos</text>
      <text x="350" y="84" fontFamily="sans-serif" fontSize="10.5" fontWeight="800" fill="#1a1a1a">hoy?</text>
      <rect x="349" y="74" width="32" height="12" rx="2" fill="#CFEE6A" opacity="0.8"/>
      <text x="350" y="84" fontFamily="sans-serif" fontSize="10.5" fontWeight="800" fill="#1a1a1a">hoy?</text>

      {/* Menu card dark */}
      <rect x="344" y="90" width="176" height="52" rx="10" fill="#1a1a1a"/>
      <rect x="350" y="96" width="46" height="14" rx="4" fill="#CFEE6A"/>
      <text x="352" y="107" fontFamily="sans-serif" fontSize="7" fontWeight="700" fill="#1a1a1a">HOY · 12-15H</text>
      <text x="350" y="122" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="white">Menú ejecutivo $7.500</text>
      <text x="350" y="134" fontFamily="sans-serif" fontSize="7" fill="#aaa">Entrada + principal + bebida</text>
      <circle cx="505" cy="116" r="11" fill="#CFEE6A"/>
      <text x="500" y="120" fontFamily="sans-serif" fontSize="12" fontWeight="700" fill="#1a1a1a">›</text>

      {/* Categories */}
      <text x="350" y="155" fontFamily="sans-serif" fontSize="8.5" fontWeight="700" fill="#1a1a1a">Categorías</text>
      <rect x="350" y="158" width="38" height="8" rx="3" fill="#CFEE6A"/>
      <rect x="393" y="158" width="38" height="8" rx="3" fill="#E0D8CC"/>
      <rect x="436" y="158" width="38" height="8" rx="3" fill="#E0D8CC"/>
    </svg>
  );
}

export function AgendaIllustration() {
  return (
    <svg viewBox="0 0 560 180" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      {/* BG dark */}
      <rect width="560" height="180" fill="#0D1F2D"/>
      <radialGradient id="ag1" cx="10%" cy="100%" r="60%">
        <stop offset="0%" stopColor="#0E4D3A" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="#0D1F2D" stopOpacity="0"/>
      </radialGradient>
      <rect width="560" height="180" fill="url(#ag1)"/>

      {/* Badge */}
      <rect x="20" y="16" width="168" height="24" rx="12" fill="#1B3D2A"/>
      <circle cx="34" cy="28" r="4" fill="#3DDC84"/>
      <text x="44" y="32.5" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="#3DDC84" letterSpacing="0.5">Turnos online · Argentina</text>

      {/* Headline */}
      <text x="20" y="68" fontFamily="sans-serif" fontSize="24" fontWeight="900" fill="white">Tu agenda online,</text>
      <text x="20" y="96" fontFamily="sans-serif" fontSize="24" fontWeight="900" fill="#3DDC84">trabaja por vos.</text>

      {/* Body */}
      <text x="20" y="118" fontFamily="sans-serif" fontSize="9" fill="#8AAABB">Reserva de turnos para peluquerías, barberías,</text>
      <text x="20" y="131" fontFamily="sans-serif" fontSize="9" fill="#8AAABB">centros de estética y consultorios.</text>

      {/* Buttons */}
      <rect x="20" y="143" width="110" height="28" rx="8" fill="#3DDC84"/>
      <text x="45" y="161.5" fontFamily="sans-serif" fontSize="9.5" fontWeight="700" fill="#0D1F2D">Comenzar gratis</text>
      <rect x="138" y="143" width="80" height="28" rx="8" fill="none" stroke="#3a5060" strokeWidth="1.5"/>
      <text x="158" y="161.5" fontFamily="sans-serif" fontSize="9.5" fontWeight="600" fill="white">Ver demo</text>

      {/* Panel card */}
      <rect x="318" y="10" width="224" height="160" rx="16" fill="#112233"/>
      <rect x="326" y="18" width="208" height="18" rx="6" fill="#1A3040"/>
      <text x="336" y="31" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="white">✦  Elegí el servicio</text>

      {/* Slot row label */}
      <text x="326" y="55" fontFamily="sans-serif" fontSize="7.5" fill="#8AAABB" letterSpacing="0.3">Horarios disponibles · Mié 18</text>

      {/* Time slots grid */}
      {[
        { x: 326, y: 60, t: "10:00", active: false },
        { x: 418, y: 60, t: "10:50", active: true },
        { x: 326, y: 82, t: "11:40", active: false, disabled: true },
        { x: 418, y: 82, t: "15:00", active: false },
        { x: 326, y: 104, t: "16:30", active: false },
        { x: 418, y: 104, t: "17:20", active: false },
      ].map((s, i) => (
        <g key={i}>
          <rect x={s.x} y={s.y} width="84" height="18" rx="6"
            fill={s.active ? "#3DDC84" : s.disabled ? "#0D1F2D" : "#1A3040"}
            stroke={s.active ? "#3DDC84" : "#1A3040"} strokeWidth="1"/>
          <text x={s.x + 42} y={s.y + 12.5} fontFamily="sans-serif" fontSize="9" fontWeight={s.active ? "700" : "500"}
            fill={s.active ? "#0D1F2D" : s.disabled ? "#3a5060" : "white"} textAnchor="middle"
            textDecoration={s.disabled ? "line-through" : "none"}>{s.t}</text>
        </g>
      ))}

      {/* Confirm button */}
      <rect x="326" y="128" width="176" height="24" rx="7" fill="#3DDC84"/>
      <text x="414" y="143.5" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="#0D1F2D" textAnchor="middle">Confirmar turno · 10:50</text>

      {/* Tooltip */}
      <rect x="380" y="154" width="100" height="16" rx="6" fill="#1A3040"/>
      <text x="430" y="165" fontFamily="sans-serif" fontSize="7.5" fill="#3DDC84" textAnchor="middle">⏱ Elegí el horario</text>
    </svg>
  );
}
