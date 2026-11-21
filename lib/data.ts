export type Editoria = { slug: string; nome: string; cor: string };

// Cores de cada editoria seguem o layout desktop (linha de links colorida).
export const EDITORIAS: Editoria[] = [
  { slug: "cidadania", nome: "Cidadania", cor: "#1c8a55" },
  { slug: "comercio", nome: "Comércio", cor: "#1e78c2" },
  { slug: "noticias", nome: "Notícias", cor: "#1a1a1a" },
  { slug: "politica", nome: "Política", cor: "#c23a56" },
  { slug: "saude", nome: "Saúde", cor: "#1f8f8a" },
  { slug: "veiculos", nome: "Veículos", cor: "#d99a12" },
  { slug: "imoveis", nome: "Imóveis", cor: "#4a4a4a" },
  { slug: "colunistas", nome: "Colunistas", cor: "#5a56b8" },
  { slug: "condominios", nome: "Condomínios", cor: "#2a6fb5" },
  { slug: "empregos", nome: "Empregos", cor: "#b58a1e" },
  { slug: "fala-o-povo", nome: "Fala o Povo", cor: "#d4482a" },
];

export const COLUNISTAS = [
  { slug: "da-redacao", nome: "Da Redação" },
  { slug: "blog-delas", nome: "Blog Delas" },
  { slug: "no-direito", nome: "No Direito" },
  { slug: "religare", nome: "Religare" },
  { slug: "moda", nome: "Moda" },
  { slug: "bem-estar", nome: "Bem-Estar" },
];

export type Noticia = {
  slug: string;
  editoria: string; // slug da editoria
  titulo: string;
  destaque?: string; // trecho em negrito no início do título (como no layout)
  chamada: string;
  imagem: string;
  alt: string;
};

// Matérias do layout. Para publicar novas, basta acrescentar itens aqui.
export const NOTICIAS: Noticia[] = [
  {
    slug: "rede-de-protecao-violencia-domestica-feminicidio-maraba",
    editoria: "cidadania",
    titulo: "Rede de proteção contra a violência doméstica e o feminicídio atua amplamente em Marabá",
    chamada: "Rede de proteção contra a violência doméstica e o feminicídio atua amplamente em Marabá",
    imagem: "/img/foto-cidadania.png",
    alt: "Mulher cobrindo o rosto com as mãos",
  },
  {
    slug: "raimundo-neto-sindicom-fortalecimento-comercio",
    editoria: "comercio",
    destaque: "Raimundo Neto",
    titulo: "Raimundo Neto, presidente do SINDICOM, prevê fortalecimento das ações beneficiando setores do comércio",
    chamada:
      "Raimundo Neto, presidente do SINDICOM, prevê fortalecimento das ações beneficiando setores do comércio",
    imagem: "/img/foto-comercio.png",
    alt: "Raimundo Neto, presidente do SINDICOM",
  },
];

export const VEREADORES = [
  { nome: "Aerton Grande", partido: "União Brasil", completo: "Aerton Lima da Cruz" },
  { nome: "Cabo Rodrigo", partido: "PL", completo: "Rodrigo Lima da Silva" },
  { nome: "Dato do Ônibus", partido: "União Brasil", completo: "Deodato do Espírito Santo" },
  { nome: "Dean Guimarães", partido: "PSD", completo: "Claudean Pereira Guimarães" },
  { nome: "Dra. Cristina Mutran", partido: "MDB", completo: "Maria Cristina Coimbra Mutran" },
  { nome: "Fernando Henrique", partido: "PL", completo: "Fernando Henrique Pereira da Silva" },
  { nome: "Ilker Moraes", partido: "MDB", completo: "Ilker Moraes Ferreira" },
  { nome: "Jocenilson Souza", partido: "PRD", completo: "Jocenilson Silva Souza" },
  { nome: "Maiana Stringari", partido: "PDT", completo: "Maiana Clara Rodrigues Stringari" },
  { nome: "Marcelo Alves", partido: "PT", completo: "Marcelo Alves dos Santos" },
  { nome: "Márcio do São Félix", partido: "PSDB", completo: "Antônio Márcio Farias Gonçalves" },
  { nome: "Marcos Andrade", partido: "PSD", completo: "Marcos Almeida Sousa de Andrade" },
  { nome: "Marcos Paulo da Agricultura", partido: "PDT", completo: "Marcos Paulo E. Pereira" },
  { nome: "Orlando Elias", partido: "PSB", completo: "Orlando da Silva Elias" },
  { nome: "Pacheco", partido: "PL", completo: "Jimmyson Mesquita Pacheco" },
  { nome: "Pastor Ronisteu", partido: "PL", completo: "Ronisteu da Silva Araújo" },
  { nome: "Pedrinho Corrêa", partido: "PRD", completo: "Pedro Corrêa Lima" },
  { nome: "Priscila Veloso", partido: "PSD", completo: "Priscila Duarte Veloso Silva" },
  { nome: "Ronaldo da 33", partido: "PDT", completo: "Ronaldo Alves Araújo" },
  { nome: "Ubirajara Sompré", partido: "MDB", completo: "Ubirajara Nazareno Sompré" },
  { nome: "Vanda Américo", partido: "União Brasil", completo: "Vanda Régia Américo Gomes" },
];

export const ESTADOS = [
  "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo",
  "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba",
  "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul",
  "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins",
];

export const ASSUNTOS = ["Publicidade", "Sugerir Pautas", "Fazer Denúncia", "Elogios"];

export const LOJAS = [
  { n: 1, bairro: "Independência", fim: "Av. Antônio Vilela 2172", tel: "(94) 992 67 32 91" },
  { n: 2, bairro: "Nova Marabá", fim: "Folha 12, Quadra 16, nº 8", tel: "(94) 999 16 84 60" },
  { n: 3, bairro: "Nova Marabá", fim: "Folha 16: Quadra 16", tel: "(94) 991 42 41 92" },
  { n: 4, bairro: "Novo Horizonte", fim: "Av. Tocantins 1043", tel: "(94) 992 98 30 59" },
];

export const NAV_EXTRA = [
  { href: "/", label: "Home" },
  { href: "/quem-somos", label: "Quem Somos" },
  { href: "/fale-conosco", label: "Fale Conosco" },
  { href: "/politica-de-privacidade", label: "Política de Privacidade" },
];

export const editoriaPorSlug = (s: string) => EDITORIAS.find((e) => e.slug === s);
