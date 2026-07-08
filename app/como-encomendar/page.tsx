import Link from "next/link";

const passos = [
  {
    numero: "1",
    titulo: "Escolha os produtos",
    texto:
      "Pesquise no catálogo por nome, categoria, marca, referência ou SKU. Depois adicione ao carrinho os produtos que pretende encomendar.",
  },
  {
    numero: "2",
    titulo: "Crie conta ou inicie sessão",
    texto:
      "Para finalizar a encomenda, entre na sua conta ou crie uma nova. Assim consegue acompanhar o estado do pedido na área de cliente.",
  },
  {
    numero: "3",
    titulo: "Submeta a encomenda",
    texto:
      "Confirme os produtos no carrinho, preencha os dados de faturação e entrega, e finalize a encomenda. A New & Recycled analisa e aprova o pedido em breve.",
  },
  {
    numero: "4",
    titulo: "Pagamento e envio",
    texto:
      "Após aprovação, recebe os dados de pagamento por email. Pague por Multibanco ou MB WAY — o pagamento é confirmado automaticamente e a encomenda avança para envio.",
  },
];

const estados = [
  "A aguardar aprovação",
  "Aprovada — aguarda pagamento",
  "Confirmado",
  "Em preparação",
  "Enviado",
];

const perguntas = [
  {
    titulo: "Quando é que pago?",
    texto:
      "Não imediatamente. Após submeter a encomenda, a New & Recycled analisa e aprova o pedido. Só depois recebe os dados de pagamento por email (Multibanco ou MB WAY). Após confirmação do pagamento, a encomenda avança automaticamente.",
  },
  {
    titulo: "E se o produto estiver por encomenda?",
    texto:
      "O prazo de entrega pode ser ligeiramente superior. Será informado por email do estado e prazo estimado após confirmação do pagamento.",
  },
  {
    titulo: "Como confirmo se um tinteiro ou toner é compatível?",
    texto:
      "Se tiver dúvidas, envie-nos a referência do consumível ou o modelo da impressora antes de encomendar. Ajudamos a confirmar a compatibilidade.",
  },
  {
    titulo: "Recebo fatura?",
    texto:
      "Sim. Depois da encomenda ser validada e processada, a documentação associada à venda é emitida com os dados fornecidos pelo cliente.",
  },
];

export default function ComoEncomendarPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-8 bg-gradient-to-br from-white via-slate-50 to-green-50 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-green-700">
                Encomendas online
              </p>

              <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
                Como encomendar na New & Recycled
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                Adicione os produtos ao carrinho, inicie sessão e finalize a encomenda.
                Após aprovação pela New & Recycled, recebe os dados de pagamento por email.
                Pague por Multibanco ou MB WAY — a confirmação é automática.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/produtos"
                  className="rounded-full bg-green-700 px-7 py-3 text-center text-sm font-bold text-white transition hover:bg-green-800"
                >
                  Ver catálogo
                </Link>

                <Link
                  href="/contacto"
                  className="rounded-full border border-slate-300 bg-white px-7 py-3 text-center text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
                >
                  Preciso de ajuda
                </Link>
              </div>
            </div>

            <aside className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
                Resumo rápido
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-sm font-bold text-slate-950">
                    Pagamento
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Após aprovação do pedido, recebe os dados por email. Multibanco ou MB WAY.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-950">
                    Portes de envio
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    3,75€ fixos para Portugal continental. Grátis a partir de 60€.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-950">
                    Apoio ao cliente
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Pode contactar-nos antes de encomendar para confirmar
                    compatibilidades.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <section className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-green-700">
                Passo a passo
              </p>

              <h2 className="mt-3 text-3xl font-black">
                O processo é simples
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-6 text-slate-500">
              Processo simples e rápido. Paga no momento e acompanha a encomenda na área de cliente.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {passos.map((passo) => (
              <article
                key={passo.numero}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-xl font-black text-green-700">
                  {passo.numero}
                </div>

                <h3 className="mt-5 text-xl font-black">{passo.titulo}</h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {passo.texto}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Importante
            </p>

            <h2 className="mt-4 text-2xl font-black">
              Pagamento simples e seguro
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Após a aprovação do pedido pela New & Recycled, receberá os dados de pagamento por email. Aceitamos Referência Multibanco e MB WAY — o pagamento é confirmado automaticamente.
            </p>

            <div className="mt-6 rounded-2xl bg-green-50 p-5">
              <p className="text-sm font-bold text-green-900">
                Pagamento simples e seguro.
              </p>
              <p className="mt-2 text-sm leading-6 text-green-800">
                Aceitamos Multibanco e MB WAY. Os portes são sempre 3,75€, grátis em compras iguais ou superiores a 60€.
              </p>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Estados da encomenda
            </p>

            <h2 className="mt-4 text-2xl font-black">
              Acompanhe tudo na sua conta
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Depois de submeter o pedido, pode consultar a encomenda na área de
              cliente e acompanhar a evolução do estado.
            </p>

            <div className="mt-6 grid gap-3">
              {estados.map((estado) => (
                <div
                  key={estado}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-green-700" />
                  <span className="text-sm font-bold text-slate-800">
                    {estado}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Portes
            </p>

            <h2 className="mt-4 text-2xl font-black">
              Como são calculados os envios?
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Os portes são fixos em 3,75€ para todo o Portugal continental, independentemente do tipo de produto. Compras iguais ou superiores a 60€ têm portes gratuitos.
            </p>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-950">
                  Todos os produtos
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Portes de 3,75€ ou grátis a partir de 60€.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-950">
                  Envio para Portugal continental
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Prazo habitual: 2 a 5 dias úteis após pagamento.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
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

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-black text-amber-900">
                Confirme antes de comprar.
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-800">
                Em consumíveis de impressão, pequenas diferenças de referência
                podem alterar a compatibilidade com a impressora.
              </p>
            </div>
          </article>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
                Perguntas frequentes
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Antes de finalizar a encomenda
              </h2>
            </div>

            <Link
              href="/contacto"
              className="rounded-full border border-slate-300 px-6 py-3 text-center text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
            >
              Falar connosco
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {perguntas.map((pergunta) => (
              <article
                key={pergunta.titulo}
                className="rounded-2xl bg-slate-50 p-5"
              >
                <h3 className="text-base font-black text-slate-950">
                  {pergunta.titulo}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {pergunta.texto}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl bg-slate-950 p-8 text-white shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-3xl font-black">Pronto para encomendar?</h2>

              <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                Consulte o catálogo, adicione os produtos ao carrinho e finalize
                a encomenda com sessão iniciada. Pague de forma segura e acompanhe a encomenda na área de cliente.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/produtos"
                className="rounded-full bg-green-700 px-8 py-4 text-center text-base font-bold text-white transition hover:bg-green-800"
              >
                Ver produtos
              </Link>

              <Link
                href="/entrar?criarConta=1"
                className="rounded-full border border-slate-600 px-8 py-4 text-center text-base font-bold text-white transition hover:border-green-400 hover:text-green-400"
              >
                Criar conta
              </Link>

              <Link
                href="/contacto"
                className="rounded-full border border-slate-600 px-8 py-4 text-center text-base font-bold text-white transition hover:border-green-400 hover:text-green-400"
              >
                Contactar
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}