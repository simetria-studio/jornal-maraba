import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AvisoCookies from "@/components/AvisoCookies";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#conteudo" className="sr-only">Ir para o conteúdo</a>
      <Header />
      <main id="conteudo" className="container">{children}</main>
      <Footer />
      <AvisoCookies />
    </>
  );
}
