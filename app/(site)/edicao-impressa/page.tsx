import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Edição impressa" };

export default function Edicao() {
  return (
    <section className="pagina" style={{ textAlign: "center" }}>
      <h1>Edição impressa</h1>
      <span className="sublinha" aria-hidden="true" style={{ marginInline: "auto" }} />
      <p style={{ marginTop: "1rem" }}>Distribuída gratuitamente nos condomínios e no comércio de Marabá.</p>
      <Image src="/img/edicao-impressa.png" alt="Capa da edição impressa do Jornal Marabá" width={352} height={373} style={{ margin: "1rem auto" }} />
      <p className="vazio">O arquivo digital da edição será disponibilizado aqui.</p>
    </section>
  );
}
