import Link from "next/link";

const categorias = [
  {
    titulo: "Toners",
    texto: "Toners originais e compatíveis para várias marcas e modelos.",
  },
  {
    titulo: "Tinteiros",
    texto: "Tinteiros e packs para impressoras domésticas e profissionais.",
  },
  {
    titulo: "Papel e Consumíveis",
    texto: "Papel, resmas e consumíveis essenciais para o dia a dia.",
  },
  {
    titulo: "Rolos Térmicos",
    texto: "Rolos para POS, TPA e equipamentos compatíveis.",
  },
  {
    titulo: "Material de Escritório",
    texto: "Canetas, pastas, capas, organização e apoio administrativo.",
  },
  {
    titulo: "Material Escolar",
    texto: "Cadernos, escrita e materiais úteis para escola e estudo.",
  },
  {
    titulo: "Limpeza e Higiene",
    texto: "Produtos para empresas, escolas, escritórios e espaços comerciais.",
  },
  {
    titulo: "Equipamento de Escritório",
    texto: "Equipamentos e acessórios para apoio ao trabalho diário.",
  },
];

const vantagens = [
  {
    titulo: "Apoio na compatibilidade",
    texto: "Ajudamos a confirmar referências de toners e tinteiros antes da encomenda.",
  },
  {
    titulo: "Encomendas validadas",
    texto: "Confirmamos stock, disponibilidade e portes antes do pagamento.",
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
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
           <div className="grid gap-6 bg-gradient-to-br from-white via-slate-50 to-green-50 p-5 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:p-10">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-green-700">
                New & Recycled
              </p>

              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
                Toners, tinteiros e material de escritório para empresas e
                particulares.
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                Encontre consumíveis, papel, rolos térmicos, material escolar,
                artigos de limpeza e equipamentos de apoio ao escritório, com
                ajuda para escolher a referência certa.
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
                {vantagens.map((vantagem) => (
                  <article
                    key={vantagem.titulo}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <p className="font-black text-slate-950">
                      {vantagem.titulo}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {vantagem.texto}
                    </p>
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
                  Soluções para escritório, consumíveis e apoio em encomendas
                  para empresas, escolas e particulares.
                </p>

                <div className="mt-5 rounded-2xl bg-green-50 p-4 text-left text-sm text-green-900">
                  <p className="font-black">Antes de pagar, validamos.</p>

                  <p className="mt-2 leading-6">
                    A encomenda é confirmada pela equipa antes do envio dos
                    dados de pagamento.
                  </p>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-600">
                  <p className="font-bold text-slate-950">
                    Contacto comercial
                  </p>

                  <p className="mt-1">José Carlos Machado</p>
                  <p className="mt-1">968 120 503</p>
                  <p className="mt-1 break-words">
                    machado.newrecycle@gmail.com
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <section className="mt-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-green-700">
                Categorias
              </p>

              <h2 className="mt-3 text-3xl font-black text-slate-950">
                O que pode encomendar
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Consulte o catálogo completo ou contacte-nos para confirmar
                disponibilidade, preços, referências e compatibilidades.
              </p>
            </div>

            <Link
              href="/produtos"
              className="text-sm font-bold text-green-700 transition hover:text-green-800"
            >
              Ver catálogo completo →
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categorias.map((categoria) => (
              <Link
                key={categoria.titulo}
                href="/produtos"
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:bg-green-50 hover:shadow-md"
              >
                <p className="text-lg font-black text-slate-950">
                  {categoria.titulo}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {categoria.texto}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Como funciona
            </p>

            <h2 className="mt-4 text-2xl font-black">
              Encomenda online, pagamento só após validação
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Ao finalizar a encomenda, o pedido fica registado para validação.
              A New & Recycled confirma stock, disponibilidade e portes antes de
              enviar os dados de pagamento.
            </p>

            <Link
              href="/como-encomendar"
              className="mt-6 inline-flex rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800"
            >
              Ver como encomendar
            </Link>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Precisa de ajuda?
            </p>

            <h2 className="mt-4 text-2xl font-black">
              Confirme referências antes de comprar
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Se tiver dúvidas sobre tinteiros, toners ou compatibilidade com a
              impressora, envie-nos a referência do consumível ou o modelo do
              equipamento antes de encomendar.
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