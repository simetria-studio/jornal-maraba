// Renderiza **trecho** como destaque em negrito (usado nas chamadas da home).
export default function Chamada({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/\*\*(.+?)\*\*/g).map((parte, i) =>
        i % 2 ? <strong key={i}>{parte}</strong> : parte,
      )}
    </>
  );
}
