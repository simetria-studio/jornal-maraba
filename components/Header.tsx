"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, Fragment } from "react";
import { COLUNISTAS, EDITORIAS, NAV_EXTRA } from "@/lib/data";

const LS = { contraste: "jm-contraste", fonte: "jm-fonte" };

function ler(k: string) {
  try { return localStorage.getItem(k); } catch { return null; }
}
function gravar(k: string, v: string) {
  try { localStorage.setItem(k, v); } catch {}
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [data, setData] = useState("");
  const [clima, setClima] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [menuCol, setMenuCol] = useState(false);
  const [fonte, setFonte] = useState(100);
  const [alto, setAlto] = useState(false);
  const pronto = useRef(false);
  const navRef = useRef<HTMLElement>(null);

  // Data em Marabá (fuso de Belém), como no cabeçalho do layout
  useEffect(() => {
    const f = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Belem", weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const t = f.format(new Date());
    setData(t.charAt(0).toUpperCase() + t.slice(1));
  }, []);

  // Máxima/mínima do dia (Open-Meteo, sem chave). Se falhar, o item some.
  useEffect(() => {
    const ctl = new AbortController();
    fetch("https://api.open-meteo.com/v1/forecast?latitude=-5.37&longitude=-49.12&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FBelem&forecast_days=1", { signal: ctl.signal })
      .then((r) => r.json())
      .then((j) => setClima(`${Math.round(j.daily.temperature_2m_max[0])}°/${Math.round(j.daily.temperature_2m_min[0])}°`))
      .catch(() => {});
    return () => ctl.abort();
  }, []);

  useEffect(() => {
    setFonte(Number(ler(LS.fonte)) || 100);
    setAlto(ler(LS.contraste) === "alto");
    pronto.current = true;
  }, []);
  useEffect(() => {
    document.documentElement.style.fontSize = fonte + "%";
    if (pronto.current) gravar(LS.fonte, String(fonte));
  }, [fonte]);
  useEffect(() => {
    if (alto) document.documentElement.setAttribute("data-contraste", "alto");
    else document.documentElement.removeAttribute("data-contraste");
    if (pronto.current) gravar(LS.contraste, alto ? "alto" : "normal");
  }, [alto]);

  useEffect(() => { setMenuCol(false); }, [pathname]);
  useEffect(() => {
    const fora = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenuCol(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuCol(false); };
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  function libras() {
    // Tradutor de Libras do governo federal (VLibras), carregado só quando o leitor pede.
    const w = window as unknown as { VLibras?: { Widget: new (u: string) => unknown }; __vl?: boolean };
    if (w.__vl) {
      document.querySelector<HTMLElement>("[vw-access-button]")?.click();
      return;
    }
    w.__vl = true;
    const host = document.createElement("div");
    host.setAttribute("vw", "");
    host.className = "enabled";
    host.innerHTML = '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
    document.body.appendChild(host);
    const s = document.createElement("script");
    s.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    s.onload = () => {
      new (window as unknown as { VLibras: { Widget: new (u: string) => unknown } }).VLibras.Widget("https://vlibras.gov.br/app");
      setTimeout(() => document.querySelector<HTMLElement>("[vw-access-button]")?.click(), 400);
    };
    document.body.appendChild(s);
  }

  function buscar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") || "").trim();
    if (q) {
      setBuscando(false);
      router.push(`/busca?q=${encodeURIComponent(q)}`);
    }
  }

  function ferramentas(id: string, classe: string) {
    return (
    <div className={classe} role="group" aria-label="Busca e acessibilidade">
      {buscando ? (
        <form className="busca-form" role="search" onSubmit={buscar}>
          <label className="sr-only" htmlFor={id}>Buscar no site</label>
          <input id={id} name="q" type="search" autoFocus placeholder="Buscar" onKeyDown={(e) => e.key === "Escape" && setBuscando(false)} />
        </form>
      ) : (
        <button type="button" aria-label="Buscar" onClick={() => setBuscando(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><circle cx="10" cy="10" r="6.5" /><path d="m15 15 6 6" /></svg>
        </button>
      )}
      <button type="button" className="contraste" aria-label="Alternar alto contraste" aria-pressed={alto} onClick={() => setAlto(!alto)} />
      <button type="button" aria-label="Aumentar tamanho do texto" onClick={() => setFonte((f) => Math.min(f + 10, 150))}>A+</button>
      <button type="button" aria-label="Diminuir tamanho do texto" onClick={() => setFonte((f) => Math.max(f - 10, 80))}>A-</button>
      <button type="button" className="libras" aria-label="Tradutor de Libras" title="Tradutor de Libras (VLibras)" onClick={libras}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 11V5.5a1.5 1.5 0 0 1 3 0V10h1V3.5a1.5 1.5 0 0 1 3 0V10h1V5a1.5 1.5 0 0 1 3 0v7.2l1-1.3a1.6 1.6 0 0 1 2.5 2L18 17.5c-1 1.6-2.600 3-5.500 3-4 0-6.500-2.800-6.500-6.500v-2.400A1.500 1.500 0 0 1 7 11Z" /></svg>
      </button>
    </div>
    );
  }

  return (
    <header>
      <div className="faixa">
        <div className="container">
          <div className="faixa-data">
            {clima && <span className="clima"><svg width="22" height="20" viewBox="0 0 26 22" aria-hidden="true"><g stroke="#f5a623" strokeWidth="2" strokeLinecap="round"><path d="M9 1.500v2M2.500 8h2M3.800 3l1.400 1.400M14.200 3l-1.400 1.400"/></g><circle cx="9" cy="8.500" r="4.200" fill="#ffc83d"/><path d="M10 20a4.500 4.500 0 0 1-.3-9A5.500 5.500 0 0 1 20.200 12 4 4 0 0 1 20 20Z" fill="#c9d3dc" stroke="#aebbc7" strokeWidth=".8"/></svg><span className="sr-only">Máxima e mínima de hoje: </span>{clima}</span>}
            <span><strong className="cidade">Marabá (PA)</strong> - {data}</span>
          </div>
          <nav className="faixa-links" aria-label="Institucional">
            {NAV_EXTRA.map((l, i) => (
              <span key={l.href}>
                <Link href={l.href} aria-current={pathname === l.href ? "page" : undefined}>{l.href === "/politica-de-privacidade" ? <><span className="rot-longo">Política de Privacidade</span><abbr className="rot-curto" title="Lei Geral de Proteção de Dados — Política de Privacidade">LGPD</abbr></> : l.label}</Link>
                {i < NAV_EXTRA.length - 1 && <span aria-hidden="true"> -</span>}
              </span>
            ))}
          </nav>
          {ferramentas("q", "ferramentas so-desktop")}
        </div>
      </div>

      <div className="container marca">
        <Link href="/" className="logo" aria-label="Jornal Marabá, página inicial">
          <span>Jornal</span>
          <Image src="/img/ponte.png" alt="" width={1805} height={773} priority />
          <span>Marabá</span>
        </Link>
      </div>

      <div className="container">
        <nav className="nav-edit" aria-label="Editorias" ref={navRef}>
          <ul>
            {EDITORIAS.map((e, k) => (
              <Fragment key={e.slug}>
              <li className={k === 4 || k === 8 ? "fim-linha" : undefined} style={{ ["--cor" as string]: e.cor }}>
                {e.slug === "colunistas" ? (
                  <>
                    <button type="button" className="drop" aria-expanded={menuCol} aria-haspopup="true" onClick={() => setMenuCol((v) => !v)}>{e.nome}</button>
                    <div className="submenu" data-aberto={menuCol}>
                      {COLUNISTAS.map((c) => <Link key={c.slug} href={`/colunistas/${c.slug}`}>{c.nome}</Link>)}
                    </div>
                  </>
                ) : (
                  <Link href={`/${e.slug}`} aria-current={pathname === `/${e.slug}` ? "page" : undefined}>{e.nome}</Link>
                )}
              </li>
              {(k === 4 || k === 8) && <li className="quebra" aria-hidden="true" />}
              </Fragment>
            ))}
          </ul>
        </nav>
        {ferramentas("q2", "ferramentas so-mobile")}
      </div>
    </header>
  );
}
