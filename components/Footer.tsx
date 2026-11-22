import Link from "next/link";
import Image from "next/image";
import { EDITORIAS, NAV_EXTRA } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="rodape">
      <hr className="linha-verde" />
      <div className="container rodape-grade">
        <div className="rodape-marca">
          <Link href="/" className="rodape-logo" aria-label="Jornal Marabá, página inicial">
            <span>Jornal</span>
            <Image src="/img/ponte.png" alt="" width={1805} height={773} />
            <span>Marabá</span>
          </Link>
          <p>Notícias, comércio e cidadania de Marabá e região.</p>
        </div>

        <nav aria-label="Editorias" className="rodape-col">
          <h2>Editorias</h2>
          <ul>
            {EDITORIAS.map((e) => (
              <li key={e.slug}><Link href={`/${e.slug}`}>{e.nome}</Link></li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Institucional" className="rodape-col">
          <h2>Institucional</h2>
          <ul>
            {NAV_EXTRA.map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
            <li><Link href="/busca">Buscar no site</Link></li>
          </ul>
        </nav>
      </div>
      <div className="rodape-base">
        <div className="container">
          <span>© {new Date().getFullYear()} Jornal Marabá · Mídia Moderna Comunicação Ltda</span>
          <Link href="/politica-de-privacidade">Política de Privacidade</Link>
        </div>
      </div>
    </footer>
  );
}
