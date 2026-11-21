import Image from "next/image";
import Link from "next/link";
import AnuncioSupermercado from "@/components/AnuncioSupermercado";
import PesquisaPopular from "@/components/PesquisaPopular";
import Chamada from "@/components/Chamada";
import { EDITORIAS } from "@/lib/data";
import { listarMaterias } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const noticias = await listarMaterias();
  const comMaterias = EDITORIAS.filter((e) => noticias.some((n) => n.editoria === e.slug));
  return (
    <>
      <AnuncioSupermercado />
      <hr className="linha-verde" />

      <div className="bloco">
        <PesquisaPopular />
      </div>

      <div className="bloco edicao">
        <Link className="chamada" href="/edicao-impressa">Click e leia a edição gratuita entregue nos condomínios e no comércio da cidade</Link>
        <Link href="/edicao-impressa" aria-label="Abrir a edição impressa">
          <Image src="/img/edicao-impressa.png" alt="Capa da edição impressa do Jornal Marabá" width={352} height={373} />
        </Link>
      </div>

      <hr className="linha-verde" />

      {comMaterias.map((e) => (
        <section key={e.slug} className="editoria-bloco" style={{ ["--cor" as string]: e.cor }} aria-labelledby={`h-${e.slug}`}>
          <h2 id={`h-${e.slug}`}><Link href={`/${e.slug}`}>{e.nome}</Link></h2>
          <span className="sublinha" aria-hidden="true" />
          {noticias.filter((n) => n.editoria === e.slug).map((n) => (
            <Link key={n.slug} href={`/noticia/${n.slug}`} className="materia">
              {n.imagem && <Image src={n.imagem} alt={n.alt} width={190} height={190} />}
              <p><Chamada texto={n.chamada} /></p>
            </Link>
          ))}
        </section>
      ))}

      <div className="midias">
        <figure>
          <Image src="/img/radio-maraba.png" alt="Rádio Marabá, a voz da cidade" width={305} height={312} />
          <span className="breve">Em breve</span>
        </figure>
        <figure>
          <Image src="/img/tv-maraba.png" alt="TV Marabá, onde a nossa gente se vê" width={277} height={267} />
          <span className="breve">Em breve</span>
        </figure>
      </div>
      <hr className="linha-verde" style={{ marginTop: "1.5rem" }} />
    </>
  );
}
