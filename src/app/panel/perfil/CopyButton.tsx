"use client";

import { useState } from "react";

interface Props {
  text: string;
  label: string;
  labelDone: string;
  className?: string;
}

export function CopyButton({ text, label, labelDone, className }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    try { navigator.clipboard?.writeText(text); } catch (_) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button onClick={handleCopy} className={className}>
      {copied ? labelDone : label}
    </button>
  );
}
