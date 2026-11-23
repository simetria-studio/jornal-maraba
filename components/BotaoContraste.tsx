"use client";

/** Ícone de contraste da matéria: aciona o mesmo alto contraste do cabeçalho. */
export default function BotaoContraste() {
  return (
    <button type="button" className="btn-contraste-materia" aria-label="Alternar alto contraste" title="Alto contraste" onClick={() => window.dispatchEvent(new Event("jm-contraste"))}>
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" fill="#000" /><circle cx="12" cy="12" r="7" fill="none" stroke="#fff" strokeWidth="1.8" /><path d="M12 5a7 7 0 0 1 0 14Z" fill="#fff" /></svg>
    </button>
  );
}
