import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { editoriaPorSlug } from "@/lib/data";
import { materiaPorSlug } from "@/lib/db";
import { lerGaleria } from "@/lib/galeria";
import { embedDeVideo } from "@/lib/video";
import Carrossel from "@/components/Carrossel";
import LerEmVoz from "@/components/LerEmVoz";
import Compartilhar from "@/components/Compartilhar";
import { limparHtml, temHtml } from "@/lib/html";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const n = await materiaPorSlug(slug);
  return { title: n?.titulo ?? "Matéria", description: n?.chamada.replace(/\*\*/g, "") };
}

export default async function Materia({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = await materiaPorSlug(slug);
  if (!n) notFound();
  const e = editoriaPorSlug(n.editoria);
  const paragrafos = n.corpo.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const rico = temHtml(n.corpo) && limparHtml(n.corpo) !== "";
  const galeria = lerGaleria(n.galeria);
  const embed = n.video ? embedDeVideo(n.video) : null;
  return (
    <article className="pagina">
      <p className="migalha"><Link href="/">Home</Link> / <Link href={`/${n.editoria}`} style={{ color: e?.cor }}>{e?.nome}</Link></p>
      <h1 id="materia-titulo">{n.titulo}</h1>
      <div className="byline">
        {n.autor === "Carlos Santos" && <img className="byline-foto" src="/img/carlos-santos.png" alt="" width={56} height={68} />}
        <p className="vazio-meta" id="materia-meta">
          {n.autor && <><strong>Por: {n.autor}</strong> · </>}
          <time dateTime={n.criado_em}>{new Date(n.criado_em + "Z").toLocaleDateString("pt-BR", { timeZone: "America/Belem", day: "numeric", month: "long", year: "numeric" })}</time>
        </p>
        <Compartilhar titulo={n.titulo} />
      </div>
      <div><LerEmVoz alvo="#materia-titulo, #materia-meta, #materia-corpo" rotulo="Ouvir esta matéria" velocidade /></div>
      {n.imagem && <Image className="materia-img" src={n.imagem} alt={n.alt} width={380} height={380} style={{ margin: "1rem 0", height: "auto" }} />}
      {embed && (
        <div className="video-materia">
          <iframe src={embed} title={`Vídeo: ${n.titulo}`} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        </div>
      )}
      <Carrossel fotos={galeria} />
      <div id="materia-corpo">
      {rico ? (
        <div className="corpo-materia" dangerouslySetInnerHTML={{ __html: limparHtml(n.corpo) }} />
      ) : paragrafos.length ? (
        paragrafos.map((p, i) => <p key={i} style={{ whiteSpace: "pre-line" }}>{p}</p>)
      ) : (
        <p className="vazio">O texto completo desta matéria ainda não foi publicado.</p>
      )}
      </div>
    </article>
  );
}
