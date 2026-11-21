// Aceita links do YouTube e do Vimeo e devolve o endereço seguro para incorporar na página.

export function embedDeVideo(url: string): string | null {
  let u: URL;
  try { u = new URL(url.trim()); } catch { return null; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.replace(/^(www\.|m\.)/, "").toLowerCase();
  const id = /^[A-Za-z0-9_-]{6,20}$/;

  if (host === "youtu.be") {
    const v = u.pathname.split("/")[1] ?? "";
    return id.test(v) ? `https://www.youtube-nocookie.com/embed/${v}` : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const partes = u.pathname.split("/").filter(Boolean);
    const v = partes[0] === "watch" ? u.searchParams.get("v") ?? "" : ["embed", "shorts", "live", "v"].includes(partes[0]) ? partes[1] ?? "" : "";
    return id.test(v) ? `https://www.youtube-nocookie.com/embed/${v}` : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const v = u.pathname.split("/").filter(Boolean).find((p) => /^\d{5,12}$/.test(p));
    return v ? `https://player.vimeo.com/video/${v}` : null;
  }
  return null;
}
