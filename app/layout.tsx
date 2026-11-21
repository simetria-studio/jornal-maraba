import type { Metadata } from "next";
import { Roboto, Lato, Young_Serif, Caladea, Caveat } from "next/font/google";
import "./globals.css";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-roboto", display: "swap" });
const lato = Lato({ subsets: ["latin"], weight: ["400", "700", "900"], style: ["normal", "italic"], variable: "--font-lato", display: "swap" });
const young = Young_Serif({ subsets: ["latin"], weight: "400", variable: "--font-young-serif", display: "swap" });
// Caladea é a versão aberta e compatível com Cambria (fonte da marca no layout).
const caladea = Caladea({ subsets: ["latin"], weight: "700", variable: "--font-caladea", display: "swap" });
// Segoe Print só existe no Windows; Caveat é a alternativa manuscrita para os demais aparelhos.
const caveat = Caveat({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Jornal Marabá", template: "%s | Jornal Marabá" },
  description: "Cidadania, comércio e notícias de Marabá (PA), no jornal impresso e no portal.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${roboto.variable} ${lato.variable} ${young.variable} ${caladea.variable} ${caveat.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
