// Limpeza de HTML da matéria. Roda no servidor (ao salvar e ao exibir) e no navegador (ao colar).
// Só passam as etiquetas da lista abaixo e, nelas, só o href de links http, https ou mailto.

const MAPA: Record<string, string> = { b: "strong", i: "em", div: "p", strong: "strong", em: "em", u: "u", p: "p", br: "br", h1: "h2", h2: "h2", h3: "h3", h4: "h3", ul: "ul", ol: "ol", li: "li", blockquote: "blockquote", a: "a" };
const VAZIAS = new Set(["br"]);

function hrefSeguro(attrs: string): string | null {
  const m = attrs.match(/href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const bruto = (m?.[1] ?? m?.[2] ?? m?.[3] ?? "").replace(/&amp;/g, "&").trim();
  if (!/^(https?:\/\/|mailto:)/i.test(bruto)) return null;
  return bruto.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function limparHtml(entrada: string): string {
  const html = entrada
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed)\b[\s\S]*?<\/\1\s*>/gi, "");
  const pilha: string[] = [];
  let saida = "";
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>|<|[^<]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    if (m[2] === undefined) { saida += m[0] === "<" ? "&lt;" : m[0]; continue; }
    const tag = MAPA[m[2].toLowerCase()];
    if (!tag) continue;
    if (m[1]) {
      if (VAZIAS.has(tag)) continue;
      const i = pilha.lastIndexOf(tag);
      if (i < 0) continue;
      while (pilha.length > i) saida += `</${pilha.pop()}>`;
    } else if (VAZIAS.has(tag)) {
      saida += "<br>";
    } else if (tag === "a") {
      const href = hrefSeguro(m[3]);
      if (!href) continue;
      pilha.push("a");
      saida += `<a href="${href}" target="_blank" rel="noopener noreferrer">`;
    } else {
      pilha.push(tag);
      saida += `<${tag}>`;
    }
  }
  while (pilha.length) saida += `</${pilha.pop()}>`;
  // remove parágrafos vazios
  return saida.replace(/<p>(\s|<br>|&nbsp;)*<\/p>/g, "").trim();
}

export function temHtml(texto: string): boolean {
  return /<\/?(p|br|strong|em|b|i|u|h[1-4]|ul|ol|li|blockquote|a|div)(?=[\s>\/])[^>]*>/i.test(texto);
}

/** Texto puro (para busca e resumos). */
export function textoPuro(corpo: string): string {
  if (!temHtml(corpo)) return corpo;
  return corpo.replace(/<\/(p|h2|h3|li|blockquote)>/g, " ").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function esc(t: string) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Matérias antigas eram texto simples (parágrafos separados por linha em branco, **negrito**). */
export function textoParaHtml(texto: string): string {
  if (!texto.trim()) return "";
  if (temHtml(texto)) return limparHtml(texto);
  return texto.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>")}</p>`).join("");
}
