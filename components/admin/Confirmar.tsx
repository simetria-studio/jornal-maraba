"use client";

import { useEffect } from "react";

export default function Confirmar() {
  useEffect(() => {
    const h = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-confirmar]");
      if (el && !window.confirm(el.dataset.confirmar)) e.preventDefault();
    };
    document.addEventListener("click", h, true);
    return () => document.removeEventListener("click", h, true);
  }, []);
  return null;
}
