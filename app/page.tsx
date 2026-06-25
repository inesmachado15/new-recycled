export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f4f8f3] text-slate-950">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-green-700">
              New & Recycled
            </p>

            <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-green-700 sm:text-5xl">
              Consumíveis e material de escritório para empresas e particulares.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Toners, tinteiros, papel, rolos térmicos, material de escritório,
              material escolar, limpeza e equipamentos, com apoio na escolha da
              referência certa.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/produtos"
                className="rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800"
              >
                Ver produtos
              </a>

              <a
                href="/contacto"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:border-green-700 hover:text-green-700"
              >
                Pedir orçamento
              </a>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="font-black text-slate-900">Entrega rápida</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Envios com confirmação após encomenda.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="font-black text-slate-900">Apoio direto</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Ajuda na compatibilidade de toners e tinteiros.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="font-black text-slate-900">Preços competitivos</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Produtos originais e compatíveis.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-green-700 p-5 shadow-xl">
            <div className="rounded-[1.5rem] bg-white p-7 text-center">
              <img
                src="/logotipo.png"
                alt="New & Recycled"
                className="mx-auto h-48 w-auto object-contain"
              />

              <p className="mt-5 text-sm leading-7 text-slate-600">
                Soluções para escritório, consumíveis e apoio em encomendas
                para empresas, escolas e particulares.
              </p>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-600">
                <p className="font-bold text-slate-900">Contacto comercial</p>
                <p className="mt-1">José Carlos Machado</p>
                <p className="mt-1">968 120 503</p>
                <p className="mt-1 break-words">
                  machado.newrecycle@gmail.com
                </p>
              </div>
            </div>
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
            </div>

            <a
              href="/produtos"
              className="text-sm font-bold text-green-700 transition hover:text-green-800"
            >
              Ver catálogo completo →
            </a>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                titulo: "Toners",
                texto: "Toners originais e compatíveis para várias marcas.",
              },
              {
                titulo: "Tinteiros",
                texto: "Tinteiros e packs para impressoras domésticas e profissionais.",
              },
              {
                titulo: "Papel e Consumíveis",
                texto: "Papel, resmas e consumíveis de apoio ao escritório.",
              },
              {
                titulo: "Rolos Térmicos",
                texto: "Rolos para POS, TPA e outros equipamentos compatíveis.",
              },
              {
                titulo: "Material de Escritório",
                texto: "Canetas, pastas, capas e outros artigos de uso diário.",
              },
              {
                titulo: "Material Escolar",
                texto: "Cadernos, escrita e materiais úteis para escola e estudo.",
              },
              {
                titulo: "Limpeza e Higiene",
                texto: "Produtos de apoio para empresas, escolas e espaços comerciais.",
              },
              {
                titulo: "Equipamento de Escritório",
                texto: "Equipamentos e acessórios para apoio ao trabalho diário.",
              },
            ].map((categoria) => (
              <a
                key={categoria.titulo}
                href="/produtos"
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-green-300 hover:bg-green-50"
              >
                <p className="text-lg font-black text-slate-900">
                  {categoria.titulo}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {categoria.texto}
                </p>
              </a>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}