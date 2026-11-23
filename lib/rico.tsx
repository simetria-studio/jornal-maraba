import { Fragment, type ReactNode } from "react";

/** Converte a marcação **negrito** e __itálico__ (vinda do Word) em elementos React. */
export function Rico({ texto }: { texto: string }): ReactNode {
  const partes = texto.split(/(\*\*[\s\S]+?\*\*)/g);
  return partes.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**") && p.length > 4) return <strong key={i}><Itl texto={p.slice(2, -2)} /></strong>;
    return <Itl key={i} texto={p} />;
  });
}

function Itl({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/(__[\s\S]+?__)/g).map((p, i) =>
        p.startsWith("__") && p.endsWith("__") && p.length > 4 ? <em key={i}>{p.slice(2, -2)}</em> : <Fragment key={i}>{p}</Fragment>,
      )}
    </>
  );
}

/** Texto puro, sem a marcação. */
export const semMarcas = (t: string) => t.replace(/\*\*|__/g, "").replace(/\s+/g, " ").trim();
