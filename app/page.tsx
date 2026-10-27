import type { Metadata } from "next";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";

export const metadata: Metadata = {
  title: "New & Recycled | Toners, tinteiros e material de escritório",
  description:
    "Mais de 9.000 produtos: toners, tinteiros e consumíveis para empresas e particulares. Portes fixos 3,75€ ou grátis em compras iguais ou superiores a 60€. Pagamento por Multibanco ou MB WAY.",
};

const categorias = [
  {
    titulo: "Toners",
    texto: "Originais e compatíveis para todas as marcas.",
    href: "/produtos?categoria=Toners",
    imagem: "/categorias/toners.jpg",
  },
  {
    titulo: "Tinteiros",
    texto: "Para impressoras domésticas e profissionais.",
    href: "/produtos?categoria=Tinteiros",
    imagem: "/categorias/tinteiros.jpg",
  },
  {
    titulo: "Consumíveis",
    texto: "Rolos térmicos, tambores e kits de manutenção.",
    href: "/produtos?categoria=Consumíveis",
    imagem: "/categorias/consumiveis.jpg",
  },
  {
    titulo: "Papelaria",
    texto: "Material de escritório, escolar e organização.",
    href: "/produtos?categoria=Papelaria",
    imagem: "/categorias/papelaria.jpg",
  },
  {
    titulo: "Equipamento",
    texto: "Impressoras, destruidoras e equipamento de escritório.",
    href: "/produtos?categoria=Equipamento de Escritório",
    imagem: "/categorias/equipamento.jpg",
  },
];

const marcas = [
  { nome: "HP", href: "/produtos?marca=HP" },
  { nome: "Canon", href: "/produtos?marca=Canon" },
  { nome: "Brother", href: "/produtos?marca=Brother" },
  { nome: "Epson", href: "/produtos?marca=Epson" },
  { nome: "Xerox", href: "/produtos?marca=Xerox" },
  { nome: "Lexmark", href: "/produtos?marca=Lexmark" },
  { nome: "Kyocera", href: "/produtos?marca=Kyocera" },
  { nome: "Konica Minolta", href: "/produtos?marca=Konica Minolta" },
  { nome: "Apli", href: "/produtos?marca=Apli" },
];

const corMarca = (i: number) =>
  i % 2 === 0
    ? "bg-green-700 text-white hover:bg-green-800"
    : "bg-green-100 text-green-900 hover:bg-green-200";

const vantagens = [
  {
    icone: "🔍",
    titulo: "Compatibilidade garantida",
    texto: "Ajudamos a confirmar a referência certa para a tua impressora.",
  },
  {
    icone: "💳",
    titulo: "Pagamento fácil",
    texto: "MB WAY e Multibanco. Portes 3,75€ ou grátis em compras iguais ou superiores a 60€.",
  },
  {
    icone: "📦",
    titulo: "Para empresas e particulares",
    texto: "Escritórios, escolas, negócios e uso doméstico.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-4">

        {/* Hero */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 bg-gradient-to-br from-white via-slate-50 to-green-50 px-7 py-8 lg:grid-cols-[1fr_160px] lg:gap-8 lg:px-10 lg:py-10">
            <div className="flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-green-700">
                New & Recycled
              </p>
              <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
                O toner certo. Ao melhor preço.
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Mais de 9.000 produtos para impressoras, escritórios e escolas. Portes fixos 3,75€ ou grátis em compras iguais ou superiores a 60€.
              </p>
              <SearchBar />
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/como-encomendar" className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700">
                  Como encomendar
                </Link>
                <Link href="/contacto" className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700">
                  Pedir ajuda
                </Link>
              </div>
            </div>

            <aside className="grid grid-cols-2 gap-1.5 content-center">
              {[
                { num: "9 000+", label: "produtos", cor: "bg-green-700 text-white" },
                { num: "3,75€", label: "portes fixos", cor: "bg-green-100 text-green-900" },
                { num: "MB WAY", label: "e Multibanco", cor: "bg-green-100 text-green-900" },
                { num: "Portes grátis", label: "a partir de 60€", cor: "bg-green-700 text-white" },
              ].map((s) => (
                <div key={s.label} className={`flex flex-col justify-center rounded-lg px-2.5 py-2 ${s.cor}`}>
                  <span className="text-xs font-black leading-none tracking-tight">{s.num}</span>
                  <span className="mt-1 text-[10px] font-medium leading-tight opacity-80">{s.label}</span>
                </div>
              ))}
            </aside>
          </div>
        </div>

        {/* Vantagens */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {vantagens.map((v) => (
            <article key={v.titulo} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-2xl">{v.icone}</p>
              <p className="mt-2 font-black text-slate-950">{v.titulo}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{v.texto}</p>
            </article>
          ))}
        </div>

        {/* Categorias */}
        <section className="mt-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-green-700">Categorias</p>
              <h2 className="mt-3 text-3xl font-black text-slate-950">O que pode encomendar</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Consulte o catálogo ou contacte-nos para confirmar disponibilidade e compatibilidades.
              </p>
            </div>
            <Link href="/produtos" className="text-sm font-bold text-green-700 transition hover:text-green-800">
              Ver catálogo completo →
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categorias.map((cat) => (
              <Link
                key={cat.titulo}
                href={cat.href}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="h-36 overflow-hidden bg-slate-100">
                  <img
                    src={cat.imagem}
                    alt={cat.titulo}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="font-black text-slate-950">{cat.titulo}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{cat.texto}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Marcas */}
        <section className="mt-12">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-green-700">Marcas</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">Principais marcas disponíveis</h2>
          <div className="mt-6 grid grid-cols-5 gap-2 sm:grid-cols-10">
            {marcas.map((m, i) => (
              <Link
                key={m.nome}
                href={m.href}
                className={`rounded-full py-2.5 text-center text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${corMarca(i)}`}
              >
                {m.nome}
              </Link>
            ))}
            <Link
              href="/produtos"
              className="rounded-full border border-dashed border-slate-300 bg-white py-2.5 text-center text-sm font-bold text-slate-400 transition hover:border-green-700 hover:text-green-700"
            >
              + outras
            </Link>
          </div>
        </section>

        {/* Como funciona + Ajuda */}
        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">Como funciona</p>
            <h2 className="mt-4 text-2xl font-black">Encomenda online, pagamento simples</h2>
            <p className="mt-4 leading-7 text-slate-600">
              Adicione produtos ao carrinho, crie conta e finalize a encomenda.
              O pagamento é feito no checkout por Multibanco ou MB WAY.
              Após confirmação, a encomenda é processada automaticamente.
              Portes fixos de 3,75€ — grátis em compras iguais ou superiores a 60€.
            </p>
            <Link
              href="/como-encomendar"
              className="mt-6 inline-flex rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800"
            >
              Ver como encomendar
            </Link>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">Precisa de ajuda?</p>
            <h2 className="mt-4 text-2xl font-black">Confirme referências antes de comprar</h2>
            <p className="mt-4 leading-7 text-slate-600">
              Se tiver dúvidas sobre tinteiros, toners ou compatibilidade com a impressora,
              envie-nos a referência do consumível ou o modelo do equipamento antes de encomendar.
              A New & Recycled ajuda a confirmar a compatibilidade.
            </p>
            <Link
              href="/contacto"
              className="mt-6 inline-flex rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
            >
              Contactar
            </Link>
          </article>
        </section>

      </section>
    </main>
  );
}
