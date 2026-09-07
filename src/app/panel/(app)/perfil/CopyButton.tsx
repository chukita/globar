"use client";

import { useState } from "react";

interface Props {
  text: string;
  label: string;
  labelDone: string;
  /** Si se pasa y el navegador soporta Web Share, abre el menú nativo de compartir en vez de copiar. */
  shareTitle?: string;
  className?: string;
}

export function CopyButton({ text, label, labelDone, shareTitle, className }: Props) {
  const [copied, setCopied] = useState(false);

  function copiar() {
    try { navigator.clipboard?.writeText(text); } catch { /* clipboard no disponible */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function handleClick() {
    // Web Share: en celular abre el menú del sistema (WhatsApp, mail, etc.) —
    // mucho más ágil que copiar y pegar. En desktop casi nunca está, así que
    // caemos a copiar al portapapeles.
    if (shareTitle && typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: shareTitle, url: text });
        return;
      } catch (e) {
        // El usuario canceló el menú — no hacemos nada.
        if (e instanceof DOMException && e.name === "AbortError") return;
        // Cualquier otro error (permiso, no soportado): copiamos.
      }
    }
    copiar();
  }

  return (
    <button onClick={handleClick} className={className}>
      {copied ? labelDone : label}
    </button>
  );
}
