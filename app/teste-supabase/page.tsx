export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f4f8f3] text-slate-950">
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.35em] text-green-700">
            New & Recycled
          </p>

          <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight text-slate-950 sm:text-6xl">
            Consumíveis e material de escritório para empresas e particulares.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Toners, tinteiros, papel, rolos térmicos, material de escritório,
            material escolar, limpeza e equipamentos com apoio na escolha da
            referência certa.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/produtos"
              className="rounded-full bg-green-700 px-8 py-4 text-base font-bold text-white shadow-md transition hover:bg-green-800"
            >
              Ver produtos
            </a>

            <a
              href="/contacto"
              className="rounded-full border border-slate-300 bg-white px-8 py-4 text-base font-bold text-slate-800 transition hover:border-green-700 hover:text-green-700"
            >
              Pedir orçamento
            </a>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-lg font-black text-slate-900">
                Entrega rápida
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Envios com confirmação após encomenda.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-lg font-black text-slate-900">
                Apoio direto
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Ajuda na compatibilidade de toners e tinteiros.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-lg font-black text-slate-900">
                Preços competitivos
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Produtos originais e compatíveis.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-green-700 p-6 shadow-xl">
          <div className="rounded-[1.5rem] bg-white p-8 text-center">
            <img
              src="/logotipo.png"
              alt="New & Recycled"
              className="mx-auto h-56 w-auto object-contain"
            />

            <p className="mt-6 text-slate-600">
              Soluções para escritório, consumíveis e apoio em encomendas para
              empresas, escolas e particulares.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-600">
              <p className="font-bold text-slate-900">Contacto comercial</p>
              <p className="mt-1">José Carlos Machado</p>
              <p className="mt-1">968 120 503</p>
              <p className="mt-1 break-words">machado.newrecycle@gmail.com</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}