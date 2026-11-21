import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirUsuario } from "@/lib/auth";
import { materiaPorId } from "@/lib/db";
import FormMateria from "@/components/admin/FormMateria";

export const metadata: Metadata = { title: "Editar matéria" };

export default async function Editar({ params }: { params: Promise<{ id: string }> }) {
  await exigirUsuario();
  const { id } = await params;
  const m = await materiaPorId(Number(id));
  if (!m) notFound();
  return (
    <>
      <div className="p-cabeca">
        <div><h1>Editar matéria</h1><p><Link href="/admin/materias">← Voltar para as matérias</Link></p></div>
        {m.publicado ? <a href={`/noticia/${m.slug}`} target="_blank" rel="noopener" className="p-btn sec">Ver no site ↗</a> : null}
      </div>
      <FormMateria key={m.id + m.atualizado_em} materia={m} />
    </>
  );
}
