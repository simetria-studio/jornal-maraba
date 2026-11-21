import type { Metadata } from "next";
import Link from "next/link";
import { exigirUsuario } from "@/lib/auth";
import FormMateria from "@/components/admin/FormMateria";

export const metadata: Metadata = { title: "Nova matéria" };

export default async function Nova() {
  await exigirUsuario();
  return (
    <>
      <div className="p-cabeca">
        <div><h1>Nova matéria</h1><p><Link href="/admin/materias">← Voltar para as matérias</Link></p></div>
      </div>
      <FormMateria />
    </>
  );
}
