export default function ComoEncomendarPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] bg-gradient-to-br from-white via-slate-50 to-green-50 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-700">
            Encomendas
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Como encomendar
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            A loja permite criar um pedido de encomenda online. Depois, a New &
            Recycled valida a disponibilidade dos produtos, confirma os portes e
            só nessa fase disponibiliza os dados de pagamento.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-xl font-black text-green-700">
              1
            </div>

            <h2 className="mt-5 text-2xl font-black">Escolha os produtos</h2>

            <p className="mt-3 leading-7 text-slate-600">
              Pesquise no catálogo por categoria, marca, referência ou SKU e
              adicione os produtos pretendidos ao carrinho.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-xl font-black text-green-700">
              2
            </div>

            <h2 className="mt-5 text-2xl font-black">Inicie sessão</h2>

            <p className="mt-3 leading-7 text-slate-600">
              Para finalizar a encomenda, crie conta ou inicie sessão. Assim
              poderá acompanhar o estado do pedido na área de cliente.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-xl font-black text-green-700">
              3
            </div>

            <h2 className="mt-5 text-2xl font-black">Submeta a encomenda</h2>

            <p className="mt-3 leading-7 text-slate-600">
              Confirme o carrinho, preencha os dados de faturação e entrega, e
              submeta o pedido para validação pela equipa.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-xl font-black text-green-700">
              4
            </div>

            <h2 className="mt-5 text-2xl font-black">Aguarde aprovação</h2>

            <p className="mt-3 leading-7 text-slate-600">
              A New & Recycled confirma stock e portes. Depois da aprovação, os
              dados de pagamento ficam disponíveis na sua conta.
            </p>
          </article>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Importante
            </p>

            <h2 className="mt-4 text-2xl font-black">
              A encomenda não é pagamento imediato
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              O pagamento só deve ser feito depois de a encomenda ser aprovada.
              Até lá, o pedido fica em validação. Isto permite confirmar stock,
              portes finais e disponibilidade antes do cliente pagar.
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Compatibilidades
            </p>

            <h2 className="mt-4 text-2xl font-black">
              Dúvidas sobre tinteiros ou toners?
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Se tiver dúvidas, envie a referência do produto ou o modelo da
              impressora antes de encomendar. A New & Recycled ajuda a confirmar
              a compatibilidade para evitar pedidos errados.
            </p>
          </section>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Portes
            </p>

            <h2 className="mt-4 text-2xl font-black">
              Como são calculados os envios?
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Toners e tinteiros têm portes de 3,75€, com portes gratuitos em
              compras iguais ou superiores a 60€. Outros produtos ficam com
              portes sob consulta, porque o valor pode depender do peso, volume
              ou tipo de encomenda.
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Área de cliente
            </p>

            <h2 className="mt-4 text-2xl font-black">
              Acompanhe o estado da encomenda
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Depois de submeter o pedido, pode consultar a encomenda na sua
              conta. Aí conseguirá ver se está a aguardar aprovação, se já foi
              aprovada, se o pagamento foi confirmado, se está em preparação ou
              se já foi enviada.
            </p>
          </section>
        </div>

        <div className="mt-10 rounded-3xl bg-slate-950 p-8 text-white">
          <h2 className="text-3xl font-black">Pronto para encomendar?</h2>

          <p className="mt-3 max-w-2xl text-slate-300">
            Consulte o catálogo, adicione os produtos ao carrinho e finalize a
            encomenda com sessão iniciada. O pedido será validado antes do
            pagamento.
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <a
              href="/produtos"
              className="rounded-full bg-green-700 px-8 py-4 text-center text-base font-bold text-white transition hover:bg-green-800"
            >
              Ver produtos
            </a>

            <a
              href="/entrar?criarConta=1"
              className="rounded-full border border-slate-600 px-8 py-4 text-center text-base font-bold text-white transition hover:border-green-400 hover:text-green-400"
            >
              Criar conta
            </a>

            <a
              href="/contacto"
              className="rounded-full border border-slate-600 px-8 py-4 text-center text-base font-bold text-white transition hover:border-green-400 hover:text-green-400"
            >
              Contactar
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}