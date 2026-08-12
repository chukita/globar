"use client";

import { useState, useEffect } from "react";

export const PROVINCIAS = [
  "Buenos Aires","CABA","Catamarca","Chaco","Chubut","Córdoba","Corrientes",
  "Entre Ríos","Formosa","Jujuy","La Pampa","La Rioja","Mendoza","Misiones",
  "Neuquén","Río Negro","Salta","San Juan","San Luis","Santa Cruz","Santa Fe",
  "Santiago del Estero","Tierra del Fuego","Tucumán",
];

export function ProvinciaLocalidadFields({
  provincia,
  localidad,
  onProvinciaChange,
  onLocalidadChange,
  required,
  disabled,
  inputClass,
  labelClass,
}: {
  provincia: string;
  localidad: string;
  onProvinciaChange: (v: string) => void;
  onLocalidadChange: (v: string) => void;
  required?: boolean;
  disabled?: boolean;
  inputClass: string;
  labelClass: string;
}) {
  const [localidades, setLocalidades] = useState<string[]>([]);
  const [loadingLoc, setLoadingLoc] = useState(false);

  useEffect(() => {
    if (!provincia) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- arranca el indicador de carga antes del fetch externo
    setLoadingLoc(true);
    fetch(`https://apis.datos.gob.ar/georef/api/municipios?provincia=${encodeURIComponent(provincia)}&max=500&campos=nombre&orden=nombre`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const nombres: string[] = [...new Set<string>((data.municipios ?? []).map((m: { nombre: string }) => m.nombre))];
        setLocalidades(nombres);
      })
      .catch(() => { if (!cancelled) setLocalidades([]); })
      .finally(() => { if (!cancelled) setLoadingLoc(false); });
    return () => { cancelled = true; };
  }, [provincia]);

  function handleProvinciaChange(value: string) {
    onProvinciaChange(value);
    onLocalidadChange("");
    setLocalidades([]);
  }

  return (
    <>
      <div>
        <label className={labelClass}>Provincia</label>
        <select value={provincia} onChange={(e) => handleProvinciaChange(e.target.value)}
          required={required} disabled={disabled} className={inputClass}>
          <option value="">Seleccioná una provincia</option>
          {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>Localidad</label>
        <select value={localidad} onChange={(e) => onLocalidadChange(e.target.value)}
          required={required} disabled={disabled || !provincia || loadingLoc} className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}>
          <option value="">
            {!provincia ? "Primero seleccioná una provincia" : loadingLoc ? "Cargando…" : "Seleccioná una localidad"}
          </option>
          {localidades.map((l, i) => <option key={`${l}-${i}`} value={l}>{l}</option>)}
        </select>
      </div>
    </>
  );
}
