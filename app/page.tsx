import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "New & Recycled | Toners, tinteiros e material de escritório",
  description:
    "Loja online de toners, tinteiros, consumíveis e papelaria para empresas e particulares em Portugal. Pagamento por Multibanco e MB WAY.",
};

const categorias = [
  {
    titulo: "Toners",
    texto: "Toners originais e compatíveis para todas as marcas.",
    href: "/produtos?categoria=Toners",
  },
  {
    titulo: "Tinteiros",
    texto: "Tinteiros para impressoras domésticas e profissionais.",
    href: "/produtos?categoria=Tinteiros",
  },
  {
    titulo: "Consumíveis",
    texto: "Rolos térmicos, tambores, kits de manutenção e mais.",
    href: "/produtos?categoria=Consumíveis",
  },
  {
    titulo: "Papelaria",
    texto: "Material de escritório, escolar e organização.",
    href: "/produtos?categoria=Papelaria",
  },
  {
    titulo: "Equipamento",
    texto: "Impressoras, destruidoras e equipamento de escritório.",
    href: "/produtos?categoria=Equipamento de Escritório",
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
  { nome: "Milan", href: "/produtos?marca=Milan" },
];

const vantagens = [
  {
    titulo: "Apoio na compatibilidade",
    texto: "Ajudamos a confirmar referências de toners e tinteiros antes da encomenda.",
  },
  {
    titulo: "Pagamento seguro",
    texto: "Multibanco e MB WAY. Portes fixos de 3,75€ ou grátis acima de 60€.",
  },
  {
    titulo: "Para empresas e particulares",
    texto: "Soluções para escritórios, escolas, negócios e uso doméstico.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-7xl px-6 py-12">

        {/* Hero */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 bg-gradient-to-br from-white via-slate-50 to-green-50 p-5 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:p-10">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-green-700">
                New & Recycled
              </p>

              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
                Toners, tinteiros e material de escritório para empresas e particulares.
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                Mais de 9.000 produtos — consumíveis de impressão, papelaria e equipamento.
                Ajuda para escolher a referência certa e pagamento seguro online.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/produtos"
                  className="rounded-full bg-green-700 px-7 py-3 text-center text-sm font-bold text-white transition hover:bg-green-800"
                >
                  Ver produtos
                </Link>
                <Link
                  href="/como-encomendar"
                  className="rounded-full border border-slate-300 bg-white px-7 py-3 text-center text-sm font-bold text-slate-800 transition hover:border-green-700 hover:text-green-700"
                >
                  Como encomendar
                </Link>
                <Link
                  href="/contacto"
                  className="rounded-full border border-slate-300 bg-white px-7 py-3 text-center text-sm font-bold text-slate-800 transition hover:border-green-700 hover:text-green-700"
                >
                  Pedir ajuda
                </Link>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {vantagens.map((v) => (
                  <article key={v.titulo} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="font-black text-slate-950">{v.titulo}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{v.texto}</p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="rounded-[1.75rem] bg-slate-950 p-3 text-white shadow-xl sm:p-5">
              <div className="rounded-[1.35rem] bg-white p-5 text-center text-slate-950 sm:p-7">
                <img
                  src="/logotipo.png"
                  alt="New & Recycled"
                  className="mx-auto h-28 w-auto object-contain sm:h-40 lg:h-44"
                />
                <p className="mt-5 text-sm leading-7 text-slate-600">
                  Consumíveis e papelaria para empresas, escolas e particulares.
                </p>
                <div className="mt-5 rounded-2xl bg-green-50 p-4 text-left text-sm text-green-900">
                  <p className="font-black">Pagamento seguro.</p>
                  <p className="mt-2 leading-6">
                    Aceitamos Multibanco e MB WAY. Encomenda processada automaticamente após pagamento.
                  </p>
                </div>
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-600">
                  <p className="font-bold text-slate-950">Contacto comercial</p>
                  <p className="mt-1">José Carlos Machado</p>
                  <p className="mt-1">968 120 503</p>
                  <p className="mt-1 break-words">machado.newrecycle@gmail.com</p>
                </div>
              </div>
            </aside>
          </div>
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
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:bg-green-50 hover:shadow-md"
              >
                <p className="text-lg font-black text-slate-950">{cat.titulo}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{cat.texto}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Marcas */}
        <section className="mt-12">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-green-700">Marcas</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">Principais marcas disponíveis</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {marcas.map((m) => (
              <Link
                key={m.nome}
                href={m.href}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-green-700 hover:text-green-700"
              >
                {m.nome}
              </Link>
            ))}
            <Link
              href="/produtos"
              className="rounded-full border border-dashed border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-400 transition hover:border-green-700 hover:text-green-700"
            >
              + muitas outras
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
              Portes fixos de 3,75€ — grátis a partir de 60€.
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
