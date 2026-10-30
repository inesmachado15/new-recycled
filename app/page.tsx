import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
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
  { nome: "HP", href: "/produtos?marca=HP", logo: "/marcas/hp.png", imgClass: "max-h-7 max-w-[3rem]" },
  { nome: "Canon", href: "/produtos?marca=Canon", logo: "/marcas/canon.png", imgClass: "max-h-9 max-w-[5rem]" },
  { nome: "Brother", href: "/produtos?marca=Brother", logo: "/marcas/brother.webp", imgClass: "max-h-8 max-w-[5.5rem]" },
  { nome: "Epson", href: "/produtos?marca=Epson", logo: "/marcas/epson.png", imgClass: "max-h-6 max-w-[4.5rem]" },
  { nome: "Xerox", href: "/produtos?marca=Xerox", logo: "/marcas/xerox.png", imgClass: "max-h-8 max-w-[4.5rem]" },
  { nome: "Lexmark", href: "/produtos?marca=Lexmark", logo: "/marcas/lexmark.webp", imgClass: "max-h-6 max-w-[5rem]" },
  { nome: "Kyocera", href: "/produtos?marca=Kyocera", logo: "/marcas/kyocera.png", imgClass: "max-h-6 max-w-[5rem]" },
  { nome: "Konica Minolta", href: "/produtos?marca=Konica Minolta", logo: "/marcas/konica.png", imgClass: "max-h-6 max-w-[4.5rem]" },
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

async function getProdutosDestaque() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("products")
    .select("slug, name, category, brand, reference, image_url, price, price_text")
    .eq("active", true)
    .in("category", ["Toners", "Tinteiros", "Consumíveis"])
    .not("image_url", "is", null)
    .not("price", "is", null)
    .gt("price", 8)
    .order("name", { ascending: true })
    .limit(16);
  return data || [];
}

export default async function HomePage() {
  const produtosDestaque = await getProdutosDestaque();
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-4">

        {/* Hero */}
        <div className="overflow-hidden rounded-[2rem] border border-green-900 bg-green-800 shadow-sm">
          <div className="grid gap-3 bg-green-800 px-6 py-4 lg:grid-cols-[1fr_180px] lg:gap-4 lg:px-8 lg:py-4">
            <div className="flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-green-300">
                New & Recycled
              </p>
              <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
                O toner certo. Ao melhor preço.
              </h1>
              <p className="mt-2 text-sm leading-6 text-green-100">
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

            <aside className="grid grid-cols-2 gap-2 content-center">
              {[
                { num: "9 000+", label: "produtos", cor: "bg-white/20 text-white" },
                { num: "3,75€", label: "portes fixos", cor: "bg-white/10 text-white" },
                { num: "MB WAY", label: "e Multibanco", cor: "bg-white/10 text-white" },
                { num: "Grátis", label: "a partir de 60€", cor: "bg-white/20 text-white" },
              ].map((s) => (
                <div key={s.label} className={`flex flex-col justify-center rounded-xl px-3 py-3 ${s.cor}`}>
                  <span className="text-base font-black leading-none tracking-tight">{s.num}</span>
                  <span className="mt-1 text-xs font-medium leading-tight opacity-80">{s.label}</span>
                </div>
              ))}
            </aside>
          </div>
        </div>

        {/* Marcas — logo após o hero */}
        <section className="mt-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Marcas</p>
          <div className="grid grid-cols-8 gap-2">
            {marcas.map((m) => (
              <Link
                key={m.nome}
                href={m.href}
                className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <img src={m.logo} alt={m.nome} className={`object-contain mix-blend-multiply ${m.imgClass}`} />
              </Link>
            ))}
          </div>
        </section>

        {/* Categorias — logo após marcas */}
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-700">Categorias</p>
            <Link href="/produtos" className="text-xs font-bold text-green-700 transition hover:text-green-800">
              Ver tudo →
            </Link>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categorias.map((cat) => (
              <Link
                key={cat.titulo}
                href={cat.href}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="h-36 overflow-hidden bg-white">
                  <img
                    src={cat.imagem}
                    alt={cat.titulo}
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-black text-slate-950">{cat.titulo}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Produtos em destaque */}
        {produtosDestaque.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-700">Mais vendidos</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Produtos em destaque</h2>
              </div>
              <Link href="/produtos" className="text-xs font-bold text-green-700 transition hover:text-green-800">
                Ver catálogo →
              </Link>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {produtosDestaque.map((p) => (
                <Link
                  key={p.slug}
                  href={`/produtos/${p.slug}`}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-44 items-center justify-center overflow-hidden rounded-t-xl bg-slate-50 p-2">
                    <Image
                      src={p.image_url!}
                      alt={p.name}
                      width={160}
                      height={120}
                      className="max-h-36 w-auto object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <span className="inline-block w-fit rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">{p.category}</span>
                    <p className="mt-1.5 text-sm font-black leading-snug text-slate-950 group-hover:text-green-700">{p.name}</p>
                    <p className="mt-auto pt-2 text-base font-black text-green-700">
                      {p.price_text
                        ? p.price_text
                        : p.price
                        ? `${p.price.toFixed(2).replace(".", ",")}€`
                        : "Sob consulta"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/produtos"
                className="inline-flex items-center gap-2 rounded-full bg-green-700 px-8 py-3 text-sm font-bold text-white transition hover:bg-green-800"
              >
                Ver todos os produtos →
              </Link>
            </div>
          </section>
        )}

        {/* Vantagens */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {vantagens.map((v) => (
            <article key={v.titulo} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-2xl">{v.icone}</p>
              <p className="mt-2 font-black text-slate-950">{v.titulo}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{v.texto}</p>
            </article>
          ))}
        </div>

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
