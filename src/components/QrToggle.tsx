"use client";

import { useState } from "react";

export function QrToggle({ svg }: { svg: string }) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div>
      <button
        onClick={() => setMostrar((v) => !v)}
        className="w-full font-semibold text-[13.5px] bg-white text-[#0C2A45] border border-[#DCE0E5] rounded-xl py-2.5 cursor-pointer"
      >
        {mostrar ? "Ocultar QR" : "Mostrar QR"}
      </button>
      {mostrar && (
        <div
          className="mt-3 flex items-center justify-center bg-white border border-[#E9ECEF] rounded-xl p-3"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </div>
  );
}
